import { Controller, Get } from '@nestjs/common';

@Controller('analytics')
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
    };
  }
}
