import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Model } from 'mongoose';
import { FEED_MODEL_NAME } from './feed.constants';
import { FeedDocument, FeedSchema } from './schemas/feed.schema';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FeedService {
  constructor(private readonly databaseService: DatabaseService) {}

  private getModel(): Model<FeedDocument> {
    const model = this.databaseService.getModel<FeedDocument>(FEED_MODEL_NAME, FeedSchema);
    if (!model) {
      throw new ServiceUnavailableException('MongoDB connection not available');
    }
    return model;
  }

  create(authorId: string, dto: CreateFeedDto) {
    return this.getModel().create({ ...dto, mediaUrls: dto.mediaUrls ?? [], authorId });
  }

  findAll(authorId: string) {
    return this.getModel().find({ authorId }).sort({ createdAt: -1 }).lean().exec();
  }

  findOne(authorId: string, id: string) {
    return this.getModel().findOne({ _id: id, authorId }).lean().exec();
  }

  update(authorId: string, id: string, dto: UpdateFeedDto) {
    return this.getModel()
      .findOneAndUpdate({ _id: id, authorId }, dto, { new: true })
      .lean()
      .exec();
  }

  remove(authorId: string, id: string) {
    return this.getModel().findOneAndDelete({ _id: id, authorId }).lean().exec();
  }

  async getAlgorithmicFeed(userId: string, followingIds: string[] = [], limit = 50, cursor?: string) {
    const model = this.getModel();

    const followingQuery = followingIds.length > 0
      ? { authorId: { $in: followingIds }, isSafe: true }
      : { authorId: { $exists: false } };

    const followingPosts = await model
      .find(followingQuery)
      .sort({ createdAt: -1 })
      .limit(Math.floor(limit * 0.7))
      .lean()
      .exec();

    const safePostsQuery = followingIds.length > 0
      ? { authorId: { $nin: followingIds }, isSafe: true }
      : { isSafe: true };

    const safePosts = await model
      .find(safePostsQuery)
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit * 0.3))
      .lean()
      .exec();

    const feed = [...followingPosts, ...safePosts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return feed.slice(0, limit);
  }

  async getReelsFeed(limit = 50, cursor?: string) {
    const model = this.getModel();

    const query = cursor
      ? { contentType: 'reel', duration: { $lte: 300 }, _id: { $lt: cursor } }
      : { contentType: 'reel', duration: { $lte: 300 } };

    return model
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }
}
