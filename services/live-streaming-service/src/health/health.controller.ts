import { Controller, Get } from '@nestjs/common';

@Controller('live-streaming')
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
    };
  }
}
