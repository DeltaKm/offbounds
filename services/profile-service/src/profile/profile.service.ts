import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatorProfile, MediaGallery } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(userId: string, data: {
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
  }): Promise<CreatorProfile> {
    return this.prisma.creatorProfile.create({
      data: {
        userId,
        displayName: data.displayName,
        bio: data.bio,
        avatarUrl: data.avatarUrl,
        bannerUrl: data.bannerUrl,
      },
    });
  }

  async getProfile(userId: string): Promise<CreatorProfile> {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, data: {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    isVerified?: boolean;
  }): Promise<CreatorProfile> {
    const profile = await this.prisma.creatorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.creatorProfile.update({
      where: { userId },
      data,
    });
  }

  async getPublicFeed(userId: string, limit = 20, cursor?: string) {
    return this.prisma.mediaGallery.findMany({
      where: {
        userId,
        isPremium: false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  async getPremiumFeed(userId: string, limit = 20, cursor?: string) {
    return this.prisma.mediaGallery.findMany({
      where: {
        userId,
        isPremium: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  async getMediaGallery(userId: string, limit = 50, cursor?: string) {
    return this.prisma.mediaGallery.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
    });
  }

  async addMedia(userId: string, data: {
    title?: string;
    description?: string;
    mediaUrl: string;
    mediaType: string;
    isPremium?: boolean;
    price?: number;
  }): Promise<MediaGallery> {
    return this.prisma.mediaGallery.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        isPremium: data.isPremium ?? false,
        price: data.price ? new Decimal(data.price) : null,
      },
    });
  }

  async deleteMedia(userId: string, mediaId: string): Promise<void> {
    const media = await this.prisma.mediaGallery.findFirst({
      where: { id: mediaId, userId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    await this.prisma.mediaGallery.delete({
      where: { id: mediaId },
    });
  }
}
