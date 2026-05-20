import { Controller, Get } from '@nestjs/common';

@Controller('social-activity')
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
    };
  }
}
