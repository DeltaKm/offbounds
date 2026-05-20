import { Controller, Get } from '@nestjs/common';

@Controller('setting')
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
    };
  }
}
