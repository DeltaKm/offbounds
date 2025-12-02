import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('registration-health')
  health() {
    return {
      status: 'ok',
      db: 'not_configured',
    };
  }
}
