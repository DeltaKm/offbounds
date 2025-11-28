import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { MongoModule } from '../database/mongo.module';
import { FEED_MODEL_NAME } from './feed.constants';
import { FeedSchema } from './schemas/feed.schema';

@Module({
  imports: [
    MongoModule,
    MongooseModule.forFeature([{ name: FEED_MODEL_NAME, schema: FeedSchema }]),
  ],
  controllers: [FeedController],
  providers: [FeedService, AuthGuard],
})
export class FeedModule {}
