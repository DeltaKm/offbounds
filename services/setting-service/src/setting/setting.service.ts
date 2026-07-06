import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { UserSetting } from '@prisma/client';

@Injectable()
export class SettingService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(userId: string, dto: UpdateSettingDto): Promise<UserSetting> {
    return this.prisma.userSetting.upsert({
      where: { userId_key: { userId, key: dto.key } },
      update: { value: dto.value as never },
      create: { userId, key: dto.key, value: dto.value as never },
    });
  }

  async findByKey(userId: string, key: string): Promise<UserSetting> {
    const setting = await this.prisma.userSetting.findUnique({
      where: { userId_key: { userId, key } },
    });
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }
    return setting;
  }

  async findByUser(userId: string): Promise<UserSetting[]> {
    return this.prisma.userSetting.findMany({
      where: { userId },
      orderBy: { key: 'asc' },
    });
  }

  async delete(userId: string, key: string): Promise<void> {
    const setting = await this.prisma.userSetting.findUnique({
      where: { userId_key: { userId, key } },
    });
    if (!setting) {
      throw new NotFoundException('Setting not found');
    }
    await this.prisma.userSetting.delete({
      where: { userId_key: { userId, key } },
    });
  }
}
