import { IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  identifier!: string; // email, username, or phone

  @IsString()
  code!: string; // 7-digit OTP

  @IsString()
  newPassword!: string;
}
