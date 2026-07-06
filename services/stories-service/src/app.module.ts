import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { StoriesModule } from './stories/stories.module';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, StoriesModule],
  controllers: [HealthController],
})
export class AppModule {}
