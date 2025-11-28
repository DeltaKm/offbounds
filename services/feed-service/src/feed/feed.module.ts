import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { DatabaseReadyGuard } from '../common/guards/database-ready.guard';

@Module({
  controllers: [FeedController],
  providers: [FeedService, AuthGuard, DatabaseReadyGuard],
})
export class FeedModule {}
