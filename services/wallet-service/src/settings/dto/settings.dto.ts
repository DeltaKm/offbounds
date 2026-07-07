import { IsString, IsOptional } from 'class-validator';

export class CreateSettingDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateSettingDto {
  @IsString()
  value: string;

  @IsString()
  @IsOptional()
  description?: string;
}
