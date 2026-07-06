import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStreamDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  streamUrl: string;

  @IsString()
  @IsOptional()
  thumbnailUrl?: string;
}
