import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  sourceType?: string;

  @IsString()
  @IsOptional()
  sourceId?: string;
}
