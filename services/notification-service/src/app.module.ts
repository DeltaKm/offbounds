import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { NotificationModule } from './notification/notification.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, NotificationModule],
  controllers: [HealthController],
})
export class AppModule {}
