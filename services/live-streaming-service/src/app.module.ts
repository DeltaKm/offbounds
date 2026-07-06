import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { LiveStreamingModule } from './live-streaming/live-streaming.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, LiveStreamingModule],
  controllers: [HealthController],
})
export class AppModule {}
