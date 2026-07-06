import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  value: unknown;
}
