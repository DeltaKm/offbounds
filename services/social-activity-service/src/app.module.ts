import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { SocialActivityModule } from './social-activity/social-activity.module';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, SocialActivityModule],
  controllers: [HealthController],
})
export class AppModule {}
