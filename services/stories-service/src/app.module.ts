import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { StoriesModule } from './stories/stories.module';

@Module({
  imports: [ConfigModule, StoriesModule],
  controllers: [HealthController],
})
export class AppModule {}
