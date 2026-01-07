import { Controller, Get, Inject } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';
import { REDIS_CLIENT, type RedisWithStatus } from './config';

@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly cache?: RedisWithStatus,
  ) {}

  @Get('auth-health')
  health() {
    const database = this.prisma?.isConnected ?? false;
    const redis = this.cache?.isConnected ?? false;

    return {
      status: database && redis ? 'ok' : 'degraded',
      database,
      redis,
    };
  }
}
// da aggiunger il rolling code