import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('wallet')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  health() {
    const database = this.prisma?.isConnected ?? false;

    return {
      status: database ? 'ok' : 'degraded',
      database,
    };
  }
}
