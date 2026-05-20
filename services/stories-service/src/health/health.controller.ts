import { Controller, Get } from '@nestjs/common';

@Controller('stories')
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
    };
  }
}
