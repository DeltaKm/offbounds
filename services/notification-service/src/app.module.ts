import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [ConfigModule, NotificationModule],
  controllers: [HealthController],
})
export class AppModule {}
