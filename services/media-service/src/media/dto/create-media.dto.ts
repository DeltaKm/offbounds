import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsNumber()
  @IsNotEmpty()
  size: number;

  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
