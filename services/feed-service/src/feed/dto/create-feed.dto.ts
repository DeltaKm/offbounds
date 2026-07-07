import { IsArray, IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsBoolean } from 'class-validator';

export class CreateFeedDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @IsEnum(['sfw', 'artistic', 'explicit'])
  @IsOptional()
  category?: string;

  @IsBoolean()
  @IsOptional()
  isSafe?: boolean;

  @IsEnum(['photo', 'video', 'reel'])
  @IsOptional()
  contentType?: string;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsEnum(['3:4', '16:9', '9:16'])
  @IsOptional()
  aspectRatio?: string;
}
