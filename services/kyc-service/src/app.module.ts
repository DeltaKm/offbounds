import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { KycModule } from './kyc/kyc.module';

@Module({
  imports: [ConfigModule, KycModule],
  controllers: [HealthController],
})
export class AppModule {}
