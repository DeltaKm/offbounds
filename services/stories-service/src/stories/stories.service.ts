import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoryDto } from './dto/create-story.dto';
import { CreateReactionDto } from './dto/reaction.dto';
import { Story, StoryView, StoryReaction } from '@prisma/client';

@Injectable()
export class StoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateStoryDto): Promise<Story> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return this.prisma.story.create({
      data: {
        userId,
        mediaUrl: dto.mediaUrl,
        mediaType: dto.mediaType,
        caption: dto.caption,
        expiresAt,
      },
    });
  }

  async findById(id: string): Promise<Story> {
    const story = await this.prisma.story.findUnique({ where: { id } });
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    return story;
  }

  async findByUser(userId: string): Promise<Story[]> {
    const now = new Date();
    return this.prisma.story.findMany({
      where: { userId, expiresAt: { gt: now } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findFeed(userId: string, followingIds: string[]): Promise<Story[]> {
    const now = new Date();
    return this.prisma.story.findMany({
      where: {
        userId: { in: followingIds },
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async delete(userId: string, storyId: string): Promise<void> {
    const story = await this.prisma.story.findFirst({
      where: { id: storyId, userId },
    });
    if (!story) {
      throw new NotFoundException('Story not found');
    }
    await this.prisma.story.delete({ where: { id: storyId } });
  }

  async view(userId: string, storyId: string): Promise<StoryView> {
    return this.prisma.storyView.create({
      data: { storyId, userId },
    });
  }

  async getViews(storyId: string): Promise<StoryView[]> {
    return this.prisma.storyView.findMany({
      where: { storyId },
      orderBy: { viewedAt: 'desc' },
    });
  }

  async react(userId: string, storyId: string, dto: CreateReactionDto): Promise<StoryReaction> {
    return this.prisma.storyReaction.upsert({
      where: { storyId_userId: { storyId, userId } },
      update: { type: dto.type },
      create: { storyId, userId, type: dto.type },
    });
  }

  async getReactions(storyId: string): Promise<StoryReaction[]> {
    return this.prisma.storyReaction.findMany({
      where: { storyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async cleanupExpired(): Promise<number> {
    const now = new Date();
    const result = await this.prisma.story.deleteMany({
      where: { expiresAt: { lt: now } },
    });
    return result.count;
  }
}
