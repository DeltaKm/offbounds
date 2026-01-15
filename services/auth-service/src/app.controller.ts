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
  liveness() {
    return { status: 'ok' };
  }

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
// da fixare la route di health per loggare il problema , l alb da errore di connessione redis o check health errato e fa rollback
// devo controllare la configurazioen di redis su aws e vedere se comunicano in modo corretto