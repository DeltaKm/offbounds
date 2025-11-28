import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { FeedContentType } from '../feed.constants';

@Schema({ versionKey: false, timestamps: { createdAt: true, updatedAt: false } })
export class Feed {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, enum: FeedContentType })
  contentType!: FeedContentType;

  @Prop({ required: true })
  contentId!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export type FeedDocument = HydratedDocument<Feed>;

export const FeedSchema = SchemaFactory.createForClass(Feed);
