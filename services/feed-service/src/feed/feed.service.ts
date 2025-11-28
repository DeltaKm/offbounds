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
}
