import { IsArray, IsBoolean, IsOptional, IsString, ArrayMinSize } from 'class-validator';

export class CreateConversationDto {
  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  participantIds: string[];
}
