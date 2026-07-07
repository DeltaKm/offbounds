import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsInt, IsEnum } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsNumber()
  @IsNotEmpty()
  size!: number;

  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsOptional()
  @IsEnum(['sfw', 'artistic', 'explicit'])
  category?: string;

  @IsOptional()
  @IsInt()
  price?: number;

  @IsOptional()
  @IsEnum(['all', 'subscribers'])
  visibility?: string;

  @IsOptional()
  @IsInt()
  durationHours?: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  hasOtherSubjects?: boolean;

  @IsOptional()
  consentIds?: Record<string, unknown>[];

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsString()
  aspectRatio?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
