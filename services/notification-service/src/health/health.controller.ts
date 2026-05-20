import { Controller, Get } from '@nestjs/common';

@Controller('notification')
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
    };
  }
}
