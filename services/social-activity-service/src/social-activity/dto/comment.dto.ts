import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  targetType: string;

  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
