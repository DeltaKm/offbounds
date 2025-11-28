import { Schema, Document } from 'mongoose';

export interface FeedDocument extends Document {
  authorId: string;
  content: string;
  mediaUrls: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const FeedSchema = new Schema<FeedDocument>(
  {
    authorId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    mediaUrls: { type: [String], default: [] },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);
