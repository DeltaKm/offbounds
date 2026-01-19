import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller()
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get('feed-health')
  health() {
    const dbReady = this.databaseService.isDbReady();

    return {
      status: dbReady ? 'ok' : 'degraded',
      db: dbReady ? 'connected' : 'disconnected',
      redis: 'connected', // da rimuovere
    };
  }
}
