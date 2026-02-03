import { Controller, Get } from '@nestjs/common';

@Controller('registration')
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
      db: 'not_configured',
    };
  }
}
