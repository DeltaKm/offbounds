import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'username can only contain letters, numbers, dots, hyphens and underscores',
  })
  username!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(64)
  password!: string;
}
