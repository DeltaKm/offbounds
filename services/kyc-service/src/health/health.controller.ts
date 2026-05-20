import { Controller, Get } from '@nestjs/common';

@Controller('kyc')
export class HealthController {
  @Get('health')
  health() {
    return {
      status: 'ok',
    };
  }
}
