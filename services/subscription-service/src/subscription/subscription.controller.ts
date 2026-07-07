import { Body, Controller, Get, Param, Post, Put, Delete, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SubscriptionService } from './subscription.service';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe/:creatorId')
  async subscribe(
    @Request() req: { user: { sub: string } },
    @Param('creatorId') creatorId: string,
    @Body() dto: { tier?: string },
  ) {
    return this.subscriptionService.subscribe(req.user.sub, creatorId, dto.tier);
  }

  @Post('unsubscribe/:creatorId')
  async unsubscribe(
    @Request() req: { user: { sub: string } },
    @Param('creatorId') creatorId: string,
  ) {
    return this.subscriptionService.unsubscribe(req.user.sub, creatorId);
  }

  @Get(':creatorId')
  async getSubscription(
    @Request() req: { user: { sub: string } },
    @Param('creatorId') creatorId: string,
  ) {
    return this.subscriptionService.getSubscription(req.user.sub, creatorId);
  }

  @Get('check/:creatorId')
  async isSubscribed(
    @Request() req: { user: { sub: string } },
    @Param('creatorId') creatorId: string,
  ) {
    const isSubscribed = await this.subscriptionService.isSubscribed(req.user.sub, creatorId);
    return { isSubscribed };
  }

  @Get('subscriber/list')
  async getSubscriberSubscriptions(@Request() req: { user: { sub: string } }) {
    return this.subscriptionService.getSubscriberSubscriptions(req.user.sub);
  }

  @Get('creator/:creatorId/list')
  async getCreatorSubscriptions(@Param('creatorId') creatorId: string) {
    return this.subscriptionService.getCreatorSubscriptions(creatorId);
  }

  @Post('tiers')
  async createTier(
    @Request() req: { user: { sub: string } },
    @Body() dto: { name: string; price: number; benefits?: string[] },
  ) {
    return this.subscriptionService.createTier(req.user.sub, dto.name, dto.price, dto.benefits);
  }

  @Get('tiers/:creatorId')
  async getTiers(@Param('creatorId') creatorId: string) {
    return this.subscriptionService.getTiers(creatorId);
  }

  @Put('tiers/:tierId')
  async updateTier(
    @Param('tierId') tierId: string,
    @Body() dto: { name?: string; price?: number; benefits?: string[]; isActive?: boolean },
  ) {
    return this.subscriptionService.updateTier(tierId, dto);
  }

  @Delete('tiers/:tierId')
  async deleteTier(@Param('tierId') tierId: string) {
    return this.subscriptionService.deleteTier(tierId);
  }
}
