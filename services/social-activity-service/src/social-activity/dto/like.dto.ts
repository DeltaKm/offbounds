import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class LikeDto {
  @IsString()
  @IsNotEmpty()
  targetType: string;

  @IsString()
  @IsNotEmpty()
  targetId: string;
}
