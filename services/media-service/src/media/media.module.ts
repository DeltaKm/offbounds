import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { WalletModule } from '@offbounds/wallet-service';
import { SubscriptionModule } from '@offbounds/subscription-service';

@Module({
  imports: [WalletModule, SubscriptionModule],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
