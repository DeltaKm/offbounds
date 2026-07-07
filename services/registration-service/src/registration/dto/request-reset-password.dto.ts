import { IsString } from 'class-validator';

export class RequestResetPasswordDto {
  @IsString()
  identifier!: string; // email, username, or phone
}
