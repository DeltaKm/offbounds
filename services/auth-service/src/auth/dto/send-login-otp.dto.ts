import { IsString } from 'class-validator';

export class SendLoginOtpDto {
  @IsString()
  identifier!: string; // email, username, or phone
}
