import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { EpochModule } from '../epoch/epoch.module';
import { SettingsModule } from '../settings/settings.module';

@Module({
  imports: [EpochModule, SettingsModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
