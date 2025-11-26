import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Il nome utente può contenere solo lettere, numeri e underscore',
  })
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
