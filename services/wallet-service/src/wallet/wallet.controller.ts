import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { EpochService } from '../epoch/epoch.service';
import { CreateWalletDto, DepositDto, WithdrawDto, TransferDto } from './wallet.dto';
import { CreatePaymentDto } from '../epoch/dto/create-payment.dto';

@Controller('wallet')
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly epochService: EpochService,
  ) {}

  @Post()
  async createWallet(@Body() dto: CreateWalletDto) {
    return this.walletService.createWallet(dto.userId);
  }

  @Get(':userId/balance')
  async getBalance(@Param('userId') userId: string) {
    return this.walletService.getBalance(userId);
  }

  @Post('deposit')
  async deposit(@Body() dto: DepositDto) {
    return this.walletService.deposit(dto.userId, dto.currency, dto.amount);
  }

  @Post('withdraw')
  async withdraw(@Body() dto: WithdrawDto) {
    return this.walletService.withdraw(dto.userId, dto.currency, dto.amount);
  }

  @Post('transfer')
  async transfer(@Body() dto: TransferDto) {
    return this.walletService.transfer(dto.fromUserId, dto.toUserId, dto.currency, dto.amount);
  }

  @Get(':userId/transactions')
  async getTransactions(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.walletService.getTransactions(userId, Number(limit) || 50, Number(offset) || 0);
  }

  @Post('purchase-stars')
  async purchaseStars(@Body() dto: CreatePaymentDto) {
    return this.epochService.createPayment(
      dto.userId,
      dto.starsAmount,
      dto.returnUrl,
      dto.cancelUrl,
    );
  }

  @Post('payouts')
  async requestPayout(@Body() dto: { userId: string; amount: number; method: string; destination: string }) {
    return this.walletService.requestPayout(dto.userId, dto.amount, dto.method, dto.destination);
  }

  @Get('payouts/:userId')
  async getPayoutRequests(@Param('userId') userId: string) {
    return this.walletService.getPayoutRequests(userId);
  }

  @Post('payouts/:payoutId/process')
  async processPayout(@Param('payoutId') payoutId: string, @Body() dto: { adminUserId: string }) {
    return this.walletService.processPayout(payoutId, dto.adminUserId);
  }
}
