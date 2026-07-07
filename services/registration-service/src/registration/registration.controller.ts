import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestEmailVerificationDto } from './dto/request-email-verification.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterUserDto) {
    return this.registrationService.register(dto);
  }

  @Post('send-otp')
  async sendOtp(@Body() dto: { phoneNumber: string }) {
    return this.registrationService.sendRegistrationOtp(dto.phoneNumber);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() dto: { phoneNumber: string; code: string }) {
    return this.registrationService.verifyRegistrationOtp(dto.phoneNumber, dto.code);
  }

  @Post('request-email-verification')
  async requestEmailVerification(@Body() dto: RequestEmailVerificationDto) {
    return this.registrationService.requestEmailVerification(dto);
  }

  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.registrationService.verifyEmail(dto);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() dto: RequestResetPasswordDto) {
    return this.registrationService.requestPasswordReset(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.registrationService.resetPassword(dto);
  }
}
