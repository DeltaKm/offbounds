import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { WalletModule } from './wallet/wallet.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [ConfigModule, PrismaModule, WalletModule],
  controllers: [HealthController],
})
export class AppModule {}
