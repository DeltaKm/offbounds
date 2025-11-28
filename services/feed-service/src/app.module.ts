import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { FeedModule } from './feed/feed.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [ConfigModule, DatabaseModule, FeedModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
