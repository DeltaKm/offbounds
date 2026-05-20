import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { DashboardCreatorModule } from './dashboard-creator/dashboard-creator.module';

@Module({
  imports: [ConfigModule, DashboardCreatorModule],
  controllers: [HealthController],
})
export class AppModule {}
