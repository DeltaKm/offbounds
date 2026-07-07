import { IsString } from 'class-validator';

export class VerifyLoginOtpDto {
  @IsString()
  identifier!: string; // email, username, or phone

  @IsString()
  code!: string; // 7-digit OTP
}
