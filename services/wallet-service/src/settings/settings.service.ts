import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PlatformSettings } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<PlatformSettings[]> {
    return this.prisma.platformSettings.findMany();
  }

  async getByKey(key: string): Promise<PlatformSettings> {
    const setting = await this.prisma.platformSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    return setting;
  }

  async create(dto: { key: string; value: string; description?: string }): Promise<PlatformSettings> {
    return this.prisma.platformSettings.create({
      data: dto,
    });
  }

  async update(key: string, dto: { value: string; description?: string }): Promise<PlatformSettings> {
    const setting = await this.prisma.platformSettings.findUnique({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`Setting with key ${key} not found`);
    }

    return this.prisma.platformSettings.update({
      where: { key },
      data: dto,
    });
  }
}
