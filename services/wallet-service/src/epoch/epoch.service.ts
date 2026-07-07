import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Decimal } from '@prisma/client/runtime/library';

const STARS_TO_EUR_RATE = 0.1;
const DEFAULT_PLATFORM_FEE_PERCENT = 12.5;
const DEFAULT_CREATOR_SHARE_PERCENT = 87.5;

export interface EpochPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  return_url: string;
  cancel_url: string;
  customer?: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface EpochPaymentResponse {
  payment_id: string;
  payment_url: string;
  status: string;
}

interface EpochWebhookPayload {
  payment_id: string;
  status: string;
  amount: number;
  currency: string;
  transaction_id: string;
  signature: string;
}

@Injectable()
export class EpochService {
  private readonly epochApiUrl: string;
  private readonly epochApiKey: string;
  private readonly epochMerchantId: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {
    this.epochApiUrl = this.config.get('EPOCH_API_URL') || 'https://api.epoch.com/v1';
    this.epochApiKey = this.config.get('EPOCH_API_KEY') || '';
    this.epochMerchantId = this.config.get('EPOCH_MERCHANT_ID') || '';
  }

  async getPlatformFeePercent(): Promise<number> {
    const setting = await this.prisma.platformSettings.findUnique({
      where: { key: 'platform_fee_percent' },
    });

    if (setting) {
      return parseFloat(setting.value);
    }

    return DEFAULT_PLATFORM_FEE_PERCENT;
  }

  async getCreatorSharePercent(): Promise<number> {
    const setting = await this.prisma.platformSettings.findUnique({
      where: { key: 'creator_share_percent' },
    });

    if (setting) {
      return parseFloat(setting.value);
    }

    return DEFAULT_CREATOR_SHARE_PERCENT;
  }

  async createPayment(userId: string, starsAmount: number, returnUrl: string, cancelUrl: string): Promise<EpochPaymentResponse> {
    const amount = starsAmount * STARS_TO_EUR_RATE;
    const platformFeePercent = await this.getPlatformFeePercent();
    const fee = amount * (platformFeePercent / 100);
    const totalAmount = amount + fee;

    const request: EpochPaymentRequest = {
      amount,
      currency: 'EUR',
      description: `Purchase ${starsAmount} stars`,
      return_url: returnUrl,
      cancel_url: cancelUrl,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<EpochPaymentResponse>(
          `${this.epochApiUrl}/payments`,
          request,
          {
            headers: {
              'Authorization': `Bearer ${this.epochApiKey}`,
              'X-Merchant-ID': this.epochMerchantId,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const purchase = await this.prisma.purchase.create({
        data: {
          userId,
          amount: new Decimal(amount),
          currency: 'EUR',
          starsAmount,
          provider: 'epoch',
          providerTxId: response.data.payment_id,
          status: 'pending',
          fee: new Decimal(fee),
          totalAmount: new Decimal(totalAmount),
        },
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to create payment with Epoch');
    }
  }

  async verifyWebhookSignature(payload: string, signature: string): Promise<boolean> {
    const expectedSignature = this.generateSignature(payload);
    return signature === expectedSignature;
  }

  private generateSignature(payload: string): string {
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', this.epochApiKey)
      .update(payload)
      .digest('hex');
  }

  async handleWebhook(payload: EpochWebhookPayload): Promise<void> {
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        providerTxId: payload.payment_id,
        provider: 'epoch',
      },
    });

    if (!purchase) {
      throw new BadRequestException('Purchase not found');
    }

    if (payload.status === 'completed' || payload.status === 'approved') {
      await this.prisma.$transaction([
        this.prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: 'confirmed' },
        }),
        this.prisma.$executeRaw`
          INSERT INTO "balances" ("walletId", "currency", "amount")
          SELECT w.id, 'STARS', ${purchase.starsAmount}
          FROM "wallets" w
          WHERE w."userId" = ${purchase.userId}
          ON CONFLICT ("walletId", "currency")
          DO UPDATE SET "amount" = "balances"."amount" + EXCLUDED."amount"
        `,
      ]);
    } else if (payload.status === 'failed' || payload.status === 'declined') {
      await this.prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: 'failed' },
      });
    }
  }

  async getPaymentStatus(paymentId: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ status: string }>(
          `${this.epochApiUrl}/payments/${paymentId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.epochApiKey}`,
              'X-Merchant-ID': this.epochMerchantId,
            },
          },
        ),
      );

      return response.data.status;
    } catch (error) {
      throw new BadRequestException('Failed to get payment status from Epoch');
    }
  }
}
