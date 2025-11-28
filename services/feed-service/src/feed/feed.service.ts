import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FEED_MODEL_NAME } from './feed.constants';
import { FeedDocument } from './schemas/feed.schema';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';

@Injectable()
export class FeedService {
  constructor(
    @InjectModel(FEED_MODEL_NAME)
    private readonly feedModel: Model<FeedDocument>,
  ) {}

  create(userId: string, dto: CreateFeedDto) {
    return this.feedModel.create({ ...dto, userId });
  }

  findAll(userId: string) {
    return this.feedModel.find({ userId }).sort({ createdAt: -1 }).lean().exec();
  }

  findOne(userId: string, id: string) {
    return this.feedModel.findOne({ _id: id, userId }).lean().exec();
  }

  update(userId: string, id: string, dto: UpdateFeedDto) {
    return this.feedModel
      .findOneAndUpdate({ _id: id, userId }, dto, { new: true })
      .lean()
      .exec();
  }

  remove(userId: string, id: string) {
    return this.feedModel.findOneAndDelete({ _id: id, userId }).lean().exec();
  }
}
