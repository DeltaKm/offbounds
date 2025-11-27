import { Controller, Get, Inject } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';
import { REDIS_CLIENT, type RedisWithStatus } from './config';

@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly cache?: RedisWithStatus,
  ) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      database: this.prisma?.isConnected ?? false,
      redis: this.cache?.isConnected ?? false,
    };
  }
}
// fix build