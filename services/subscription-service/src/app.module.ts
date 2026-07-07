import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, SubscriptionModule],
  controllers: [HealthController],
})
export class AppModule {}
