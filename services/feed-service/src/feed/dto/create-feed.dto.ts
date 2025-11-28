import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFeedDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];
}
