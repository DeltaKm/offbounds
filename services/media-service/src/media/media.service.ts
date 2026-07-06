import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { Media } from '@prisma/client';

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateMediaDto): Promise<Media> {
    return this.prisma.media.create({
      data: {
        userId,
        url: dto.url,
        mimeType: dto.mimeType,
        size: dto.size,
        filename: dto.filename,
        metadata: dto.metadata ? (dto.metadata as never) : undefined,
      },
    });
  }

  async findById(id: string): Promise<Media> {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) {
      throw new NotFoundException('Media not found');
    }
    return media;
  }

  async findByUser(userId: string, limit = 20): Promise<Media[]> {
    return this.prisma.media.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async delete(userId: string, mediaId: string): Promise<void> {
    const media = await this.prisma.media.findFirst({
      where: { id: mediaId, userId },
    });
    if (!media) {
      throw new NotFoundException('Media not found');
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
}
