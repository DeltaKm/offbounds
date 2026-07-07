import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '@offbounds/wallet-service';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
  ) {}

  async subscribe(subscriberId: string, creatorId: string, tierName = 'standard') {
    // Check if already subscribed
    const existing = await this.prisma.subscription.findUnique({
      where: { subscriberId_creatorId: { subscriberId, creatorId } },
    });

    if (existing && existing.status === 'active') {
      throw new BadRequestException('Already subscribed to this creator');
    }

    // Get or create subscription tier
    const tier = await this.prisma.subscriptionTier.findFirst({
      where: { creatorId, name: tierName, isActive: true },
    });

    if (!tier) {
      // Create default tier if not exists
      await this.prisma.subscriptionTier.create({
        data: {
          creatorId,
          name: tierName,
          price: 100, // Default 100 stars per month
        },
      });
    }

    const finalTier = tier || await this.prisma.subscriptionTier.findFirst({
      where: { creatorId, name: tierName },
    });

    if (!finalTier) {
      throw new NotFoundException('Subscription tier not found');
    }

    // Deduct stars from subscriber
    try {
      await this.walletService.withdraw(subscriberId, 'STARS', finalTier.price);
    } catch (error) {
      throw new BadRequestException('Insufficient stars to subscribe');
    }

    // Add creator earnings
    await this.walletService.addCreatorEarnings(creatorId, finalTier.price);

    // Calculate end date (30 days from now)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    // Create or update subscription
    const subscription = await this.prisma.subscription.upsert({
      where: { subscriberId_creatorId: { subscriberId, creatorId } },
      update: {
        tier: tierName,
        price: finalTier.price,
        status: 'active',
        startDate: new Date(),
        endDate,
        cancelledAt: null,
        autoRenew: true,
      },
      create: {
        subscriberId,
        creatorId,
        tier: tierName,
        price: finalTier.price,
        status: 'active',
        startDate: new Date(),
        endDate,
        autoRenew: true,
      },
    });

    return subscription;
  }

  async unsubscribe(subscriberId: string, creatorId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { subscriberId_creatorId: { subscriberId, creatorId } },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status !== 'active') {
      throw new BadRequestException('Subscription is not active');
    }

    return this.prisma.subscription.update({
      where: { subscriberId_creatorId: { subscriberId, creatorId } },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        autoRenew: false,
      },
    });
  }

  async getSubscription(subscriberId: string, creatorId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { subscriberId_creatorId: { subscriberId, creatorId } },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Check if expired
    if (subscription.endDate < new Date() && subscription.status === 'active') {
      await this.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'expired' },
      });
      subscription.status = 'expired';
    }

    return subscription;
  }

  async isSubscribed(subscriberId: string, creatorId: string): Promise<boolean> {
    try {
      const subscription = await this.getSubscription(subscriberId, creatorId);
      return subscription.status === 'active' && subscription.endDate > new Date();
    } catch {
      return false;
    }
  }

  async getSubscriberSubscriptions(subscriberId: string) {
    return this.prisma.subscription.findMany({
      where: { subscriberId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCreatorSubscriptions(creatorId: string) {
    return this.prisma.subscription.findMany({
      where: { creatorId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTier(creatorId: string, name: string, price: number, benefits?: string[]) {
    return this.prisma.subscriptionTier.create({
      data: {
        creatorId,
        name,
        price,
        benefits: benefits ? (benefits as never) : undefined,
      },
    });
  }

  async getTiers(creatorId: string) {
    return this.prisma.subscriptionTier.findMany({
      where: { creatorId, isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async updateTier(tierId: string, data: { name?: string; price?: number; benefits?: string[]; isActive?: boolean }) {
    return this.prisma.subscriptionTier.update({
      where: { id: tierId },
      data: {
        ...data,
        benefits: data.benefits ? (data.benefits as never) : undefined,
      },
    });
  }

  async deleteTier(tierId: string) {
    return this.prisma.subscriptionTier.delete({
      where: { id: tierId },
    });
  }
}
