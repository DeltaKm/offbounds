import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, ChatModule],
  controllers: [HealthController],
})
export class AppModule {}
