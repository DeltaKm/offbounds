import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KycService } from './kyc.service';

@Controller('kyc')
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('start')
  startVerification(@Request() req: { user: { sub: string } }) {
    return this.kycService.startVerification(req.user.sub);
  }

  @Get('status')
  getStatus(@Request() req: { user: { sub: string } }) {
    return this.kycService.getVerificationStatus(req.user.sub);
  }

  @Get('is-adult')
  isAdultVerified(@Request() req: { user: { sub: string } }) {
    return this.kycService.isAdultVerified(req.user.sub);
  }

  @Post('webhook')
  handleWebhook(@Body() payload: unknown) {
    return this.kycService.handleWebhook(payload);
  }
}
