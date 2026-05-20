import { Controller, Get } from '@nestjs/common';

@Controller('chat')
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
    };
  }
}
