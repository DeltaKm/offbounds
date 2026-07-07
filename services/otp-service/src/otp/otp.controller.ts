import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { OtpService, OtpPurpose } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendOtp(@Body() dto: { phoneNumber: string; purpose: OtpPurpose }) {
    await this.otpService.generateOtp(dto.phoneNumber, dto.purpose);
    return { message: 'OTP sent' };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() dto: { phoneNumber: string; code: string; purpose: OtpPurpose }) {
    const isValid = await this.otpService.validateOtp(dto.phoneNumber, dto.code, dto.purpose);
    return { valid: isValid };
  }
}
