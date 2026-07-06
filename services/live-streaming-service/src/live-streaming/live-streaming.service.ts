import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { Stream, StreamViewer } from '@prisma/client';

@Injectable()
export class LiveStreamingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateStreamDto): Promise<Stream> {
    return this.prisma.stream.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        streamUrl: dto.streamUrl,
        thumbnailUrl: dto.thumbnailUrl,
        status: 'idle',
      },
    });
  }

  async findById(id: string): Promise<Stream> {
    const stream = await this.prisma.stream.findUnique({ where: { id } });
    if (!stream) {
      throw new NotFoundException('Stream not found');
    }
    return stream;
  }

  async findByUser(userId: string): Promise<Stream[]> {
    return this.prisma.stream.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(): Promise<Stream[]> {
    return this.prisma.stream.findMany({
      where: { status: 'live' },
      orderBy: { viewerCount: 'desc' },
    });
  }

  async start(userId: string, streamId: string): Promise<Stream> {
    const stream = await this.prisma.stream.findFirst({
      where: { id: streamId, userId },
    });
    if (!stream) {
      throw new NotFoundException('Stream not found');
    }
    return this.prisma.stream.update({
      where: { id: streamId },
      data: { status: 'live', startedAt: new Date() },
    });
  }

  async stop(userId: string, streamId: string): Promise<Stream> {
    const stream = await this.prisma.stream.findFirst({
      where: { id: streamId, userId },
    });
    if (!stream) {
      throw new NotFoundException('Stream not found');
    }
    return this.prisma.stream.update({
      where: { id: streamId },
      data: { status: 'ended', endedAt: new Date() },
    });
  }

  async delete(userId: string, streamId: string): Promise<void> {
    const stream = await this.prisma.stream.findFirst({
      where: { id: streamId, userId },
    });
    if (!stream) {
      throw new NotFoundException('Stream not found');
    }
    await this.prisma.stream.delete({ where: { id: streamId } });
  }

  async join(userId: string, streamId: string): Promise<StreamViewer> {
    return this.prisma.streamViewer.create({
      data: { streamId, userId },
    });
  }

  async leave(userId: string, streamId: string): Promise<void> {
    const viewer = await this.prisma.streamViewer.findUnique({
      where: { streamId_userId: { streamId, userId } },
    });
    if (!viewer) {
      throw new NotFoundException('Viewer not found');
    }
    await this.prisma.streamViewer.update({
      where: { id: viewer.id },
      data: { leftAt: new Date() },
    });
  }

  async getViewerCount(streamId: string): Promise<number> {
    const count = await this.prisma.streamViewer.count({
      where: { streamId, leftAt: null },
    });
    return count;
  }

  async updateViewerCount(streamId: string): Promise<Stream> {
    const count = await this.getViewerCount(streamId);
    return this.prisma.stream.update({
      where: { id: streamId },
      data: { viewerCount: count },
    });
  }
}
