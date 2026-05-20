import { Controller, Get } from '@nestjs/common';

@Controller('dashboard-creator')
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
    };
  }
}
