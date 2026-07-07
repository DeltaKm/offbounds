import { IsOptional, IsString, MinLength, IsInt, IsDateString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  mediaThumbnail?: string;

  @IsOptional()
  @IsInt()
  price?: number;

  @IsOptional()
  @IsInt()
  ttlSeconds?: number;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;
}
