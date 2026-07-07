import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

const STARS_TO_EUR_RATE = 0.1;
const PLATFORM_FEE_PERCENT = 12.5;
const CREATOR_SHARE_PERCENT = 87.5;

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async createWallet(userId: string) {
    const existing = await this.prisma.wallet.findUnique({ where: { userId } });
    if (existing) {
      throw new BadRequestException('Wallet already exists for this user');
    }

    return this.prisma.wallet.create({
      data: { userId },
      include: { balances: true },
    });
  }

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: { balances: true },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      userId: wallet.userId,
      balances: wallet.balances.map((b) => ({
        currency: b.currency,
        amount: b.amount.toString(),
      })),
    };
  }

  async deposit(userId: string, currency: string, amount: number) {
    let wallet = await this.prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({ data: { userId } });
    }

    const balance = await this.prisma.balance.findUnique({
      where: { walletId_currency: { walletId: wallet.id, currency } },
    });

    const newAmount = balance
      ? balance.amount.add(new Decimal(amount))
      : new Decimal(amount);

    await this.prisma.balance.upsert({
      where: { walletId_currency: { walletId: wallet.id, currency } },
      update: { amount: newAmount },
      create: { walletId: wallet.id, currency, amount: newAmount },
    });

    await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'deposit',
        currency,
        amount: new Decimal(amount),
        status: 'confirmed',
      },
    });

    return { success: true, newBalance: newAmount.toString() };
  }

  async withdraw(userId: string, currency: string, amount: number) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const balance = await this.prisma.balance.findUnique({
      where: { walletId_currency: { walletId: wallet.id, currency } },
    });

    if (!balance || balance.amount.lessThan(new Decimal(amount))) {
      throw new BadRequestException('Insufficient balance');
    }

    const newAmount = balance.amount.sub(new Decimal(amount));

    await this.prisma.balance.update({
      where: { walletId_currency: { walletId: wallet.id, currency } },
      data: { amount: newAmount },
    });

    await this.prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'withdraw',
        currency,
        amount: new Decimal(amount),
        status: 'confirmed',
      },
    });

    return { success: true, newBalance: newAmount.toString() };
  }

  async transfer(fromUserId: string, toUserId: string, currency: string, amount: number) {
    const fromWallet = await this.prisma.wallet.findUnique({ where: { userId: fromUserId } });
    if (!fromWallet) {
      throw new NotFoundException('Sender wallet not found');
    }

    let toWallet = await this.prisma.wallet.findUnique({ where: { userId: toUserId } });
    if (!toWallet) {
      toWallet = await this.prisma.wallet.create({ data: { userId: toUserId } });
    }

    const fromBalance = await this.prisma.balance.findUnique({
      where: { walletId_currency: { walletId: fromWallet.id, currency } },
    });

    if (!fromBalance || fromBalance.amount.lessThan(new Decimal(amount))) {
      throw new BadRequestException('Insufficient balance');
    }

    const toBalance = await this.prisma.balance.findUnique({
      where: { walletId_currency: { walletId: toWallet.id, currency } },
    });

    const newFromAmount = fromBalance.amount.sub(new Decimal(amount));
    const newToAmount = toBalance
      ? toBalance.amount.add(new Decimal(amount))
      : new Decimal(amount);

    await this.prisma.$transaction([
      this.prisma.balance.update({
        where: { walletId_currency: { walletId: fromWallet.id, currency } },
        data: { amount: newFromAmount },
      }),
      this.prisma.balance.upsert({
        where: { walletId_currency: { walletId: toWallet.id, currency } },
        update: { amount: newToAmount },
        create: { walletId: toWallet.id, currency, amount: newToAmount },
      }),
      this.prisma.transaction.create({
        data: {
          walletId: fromWallet.id,
          type: 'transfer',
          currency,
          amount: new Decimal(amount).negated(),
          status: 'confirmed',
          metadata: { toUserId },
        },
      }),
      this.prisma.transaction.create({
        data: {
          walletId: toWallet.id,
          type: 'transfer',
          currency,
          amount: new Decimal(amount),
          status: 'confirmed',
          metadata: { fromUserId },
        },
      }),
    ]);

    return { success: true };
  }

  async getTransactions(userId: string, limit: number, offset: number) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return transactions.map((tx) => ({
      id: tx.id,
      type: tx.type,
      currency: tx.currency,
      amount: tx.amount.toString(),
      status: tx.status,
      metadata: tx.metadata,
      createdAt: tx.createdAt,
    }));
  }

  async purchaseStars(
    userId: string,
    starsAmount: number,
    provider: string,
    providerTxId?: string,
  ) {
    const eurAmount = new Decimal(starsAmount).mul(STARS_TO_EUR_RATE);
    const fee = eurAmount.mul(PLATFORM_FEE_PERCENT).div(100);
    const totalAmount = eurAmount.add(fee);

    const purchase = await this.prisma.purchase.create({
      data: {
        userId,
        amount: eurAmount,
        currency: 'EUR',
        starsAmount,
        provider,
        providerTxId,
        status: 'pending',
        fee,
        totalAmount,
      },
    });

    return purchase;
  }

  async confirmPurchase(purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
    });

    if (!purchase || purchase.status !== 'pending') {
      throw new BadRequestException('Invalid purchase');
    }

    await this.prisma.$transaction([
      this.prisma.purchase.update({
        where: { id: purchaseId },
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

    return { success: true };
  }

  async addCreatorEarnings(userId: string, starsAmount: number) {
    const eurAmount = new Decimal(starsAmount).mul(STARS_TO_EUR_RATE);
    const creatorShare = eurAmount.mul(CREATOR_SHARE_PERCENT).div(100);

    const earnings = await this.prisma.creatorEarnings.upsert({
      where: { userId },
      update: {
        totalEarned: { increment: creatorShare },
        available: { increment: creatorShare },
      },
      create: {
        userId,
        totalEarned: creatorShare,
        available: creatorShare,
        pending: new Decimal(0),
      },
    });

    return earnings;
  }

  async getCreatorEarnings(userId: string) {
    const earnings = await this.prisma.creatorEarnings.findUnique({
      where: { userId },
    });

    if (!earnings) {
      return {
        totalEarned: '0',
        available: '0',
        pending: '0',
        currency: 'EUR',
      };
    }

    return {
      totalEarned: earnings.totalEarned.toString(),
      available: earnings.available.toString(),
      pending: earnings.pending.toString(),
      currency: earnings.currency,
    };
  }

  async requestPayout(
    userId: string,
    amount: number,
    method: string,
    destination: string,
  ) {
    const earnings = await this.prisma.creatorEarnings.findUnique({
      where: { userId },
    });

    if (!earnings || earnings.available.lessThan(new Decimal(amount))) {
      throw new BadRequestException('Insufficient available earnings');
    }

    const payout = await this.prisma.$transaction([
      this.prisma.creatorEarnings.update({
        where: { userId },
        data: {
          available: { decrement: amount },
          pending: { increment: amount },
        },
      }),
      this.prisma.payoutRequest.create({
        data: {
          userId,
          amount: new Decimal(amount),
          currency: 'EUR',
          method,
          destination,
          status: 'pending',
        },
      }),
    ]);

    return payout[1];
  }

  async getPayoutRequests(userId: string) {
    return this.prisma.payoutRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async processPayout(payoutId: string, adminUserId: string) {
    const payout = await this.prisma.payoutRequest.findUnique({
      where: { id: payoutId },
    });

    if (!payout || payout.status !== 'pending') {
      throw new BadRequestException('Invalid payout request');
    }

    await this.prisma.$transaction([
      this.prisma.payoutRequest.update({
        where: { id: payoutId },
        data: {
          status: 'processed',
          processedAt: new Date(),
          processedBy: adminUserId,
        },
      }),
      this.prisma.creatorEarnings.update({
        where: { userId: payout.userId },
        data: {
          pending: { decrement: payout.amount },
        },
      }),
    ]);

    return { success: true };
  }
}
