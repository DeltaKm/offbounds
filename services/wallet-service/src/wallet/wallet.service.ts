import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

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
}
