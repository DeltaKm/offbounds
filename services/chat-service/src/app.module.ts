import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [ConfigModule, ChatModule],
  controllers: [HealthController],
})
export class AppModule {}
