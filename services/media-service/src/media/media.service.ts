import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { Media } from '@prisma/client';
import { WalletService } from '@offbounds/wallet-service';
import { SubscriptionService } from '@offbounds/subscription-service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: WalletService,
    private readonly subscriptionService: SubscriptionService,
    private readonly jwtService: JwtService,
  ) {}

  async create(userId: string, dto: CreateMediaDto): Promise<Media> {
    if (dto.category === 'explicit' && dto.visibility === 'all') {
      throw new BadRequestException('Explicit content cannot be visible to all');
    }

    let expiresAt: Date | undefined;
    if (dto.durationHours) {
      expiresAt = new Date(Date.now() + dto.durationHours * 60 * 60 * 1000);
    }

    const isShortVideo = Boolean(dto.duration && dto.duration <= 300 && dto.aspectRatio === '9:16');

    return this.prisma.media.create({
      data: {
        userId,
        url: dto.url,
        thumbnailUrl: dto.thumbnailUrl,
        mimeType: dto.mimeType,
        size: dto.size,
        filename: dto.filename,
        category: dto.category || 'sfw',
        price: dto.price,
        isPaid: !!dto.price,
        visibility: dto.visibility || 'all',
        expiresAt,
        location: dto.location,
        hasOtherSubjects: !!dto.hasOtherSubjects,
        consentIds: dto.consentIds ? (dto.consentIds as never) : undefined,
        duration: dto.duration,
        isShortVideo,
        metadata: dto.metadata ? (dto.metadata as never) : undefined,
      },
    });
  }

  async findById(id: string, userId?: string): Promise<Media> {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.visibility === 'subscribers' && userId !== media.userId) {
      if (!userId) {
        throw new BadRequestException('Authentication required for subscriber-only content');
      }
      const isSubscribed = await this.subscriptionService.isSubscribed(userId, media.userId);
      if (!isSubscribed) {
        throw new BadRequestException('Content is for subscribers only');
      }
    }

    if (media.expiresAt && media.expiresAt < new Date()) {
      throw new NotFoundException('Content has expired');
    }

    return media;
  }

  async findByUser(
    userId: string,
    options: {
      limit?: number;
      category?: string;
      visibility?: string;
    } = {},
  ): Promise<Media[]> {
    const where: Record<string, unknown> = { userId };
    if (options.category) {
      where.category = options.category;
    }
    if (options.visibility) {
      where.visibility = options.visibility;
    }

    return this.prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 20,
    });
  }

  async findFeed(userId?: string, options: { limit?: number; before?: string } = {}): Promise<Media[]> {
    const where: Record<string, unknown> = {
      visibility: 'all',
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    };

    if (options.before) {
      where.createdAt = { lt: new Date(options.before) };
    }

    return this.prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 20,
    });
  }

  async findShortVideos(options: { limit?: number; before?: string } = {}): Promise<Media[]> {
    const where: Record<string, unknown> = {
      isShortVideo: true,
      visibility: 'all',
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    };

    if (options.before) {
      where.createdAt = { lt: new Date(options.before) };
    }

    return this.prisma.media.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options.limit || 20,
    });
  }

  async delete(userId: string, mediaId: string): Promise<void> {
    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, userId },
    });
    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.isPaid) {
      throw new BadRequestException('Cannot delete paid content that has been unlocked');
    }

    await this.prisma.media.delete({ where: { id: mediaId } });
  }

  async updateMetadata(userId: string, mediaId: string, metadata: Record<string, unknown>): Promise<Media> {
    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, userId },
    });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return this.prisma.media.update({
      where: { id: mediaId },
      data: { metadata: metadata as never },
    });
  }

  async unlockMedia(mediaId: string, userId: string): Promise<Media> {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media || !media.isPaid) {
      throw new NotFoundException('Media not found or not paid content');
    }

    if (media.userId === userId) {
      return media;
    }

    if (!media.price) {
      throw new BadRequestException('Media has no price');
    }

    try {
      await this.walletService.withdraw(userId, 'STARS', media.price);
    } catch (error) {
      throw new BadRequestException('Insufficient stars to unlock media');
    }

    await this.walletService.addCreatorEarnings(media.userId, media.price);

    return media;
  }

  async generateShareLink(userId: string, mediaId: string) {
    const media = await this.prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.userId !== userId) {
      throw new BadRequestException('Cannot share media from other users');
    }

    const payload = { mediaId, userId };
    const token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      shareLink: `https://offbounds.com/share/${token}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };
  }
}
