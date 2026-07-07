import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendLoginOtpDto } from './dto/send-login-otp.dto';
import { VerifyLoginOtpDto } from './dto/verify-login-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokenPayload } from '@offbounds/shared-types';

interface AuthenticatedRequest extends Request {
  user: TokenPayload;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login/send-otp')
  async sendLoginOtp(@Body() dto: SendLoginOtpDto) {
    return this.authService.sendLoginOtp(dto);
  }

  @Post('login/verify-otp')
  async verifyLoginOtp(@Body() dto: VerifyLoginOtpDto, @Req() req: Request) {
    return this.authService.verifyLoginOtp(dto, req);
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refresh(dto, req);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Body() dto: RefreshTokenDto) {
    await this.authService.logout(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: AuthenticatedRequest) {
    return this.authService.me(req.user.sub);
  }
}
