import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto, DepositDto, WithdrawDto, TransferDto } from './wallet.dto';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

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
}
