import { Controller, Get } from '@nestjs/common';

@Controller('media')
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
    };
  }
}
