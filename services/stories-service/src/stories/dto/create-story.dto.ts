import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStoryDto {
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @IsString()
  @IsNotEmpty()
  mediaType: string;

  @IsString()
  @IsOptional()
  caption?: string;
}
