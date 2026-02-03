import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('feed')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('health')
  health() {
    const dbReady = this.databaseService.isDbReady();

    return {
      status: dbReady ? 'ok' : 'degraded',
      db: dbReady ? 'connected' : 'disconnected',
      redis: 'connected', // da rimuovere
    };
  }
}
