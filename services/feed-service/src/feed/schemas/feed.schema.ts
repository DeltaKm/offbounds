import { Schema, Document } from 'mongoose';

export interface FeedDocument extends Document {
  authorId: string;
  content: string;
  mediaUrls: string[];
  category: string;
  isSafe: boolean;
  contentType: string;
  duration?: number;
  aspectRatio: string;
  createdAt: Date;
  updatedAt: Date;
}

export const FeedSchema = new Schema<FeedDocument>(
  {
    authorId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    mediaUrls: { type: [String], default: [] },
    category: { type: String, enum: ['sfw', 'artistic', 'explicit'], default: 'sfw' },
    isSafe: { type: Boolean, default: true },
    contentType: { type: String, enum: ['photo', 'video', 'reel'], default: 'photo' },
    duration: { type: Number },
    aspectRatio: { type: String, enum: ['3:4', '16:9', '9:16'], default: '9:16' },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
