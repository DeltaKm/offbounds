import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  identifier!: string; // email o username

  @IsString()
  @MinLength(8)
  password!: string;
}
