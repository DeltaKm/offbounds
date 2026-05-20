import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [ConfigModule, AnalyticsModule],
  controllers: [HealthController],
})
export class AppModule {}
