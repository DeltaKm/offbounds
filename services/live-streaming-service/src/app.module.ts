import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { LiveStreamingModule } from './live-streaming/live-streaming.module';

@Module({
  imports: [ConfigModule, LiveStreamingModule],
  controllers: [HealthController],
})
export class AppModule {}
