import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReactionDto {
  @IsString()
  @IsNotEmpty()
  type: string;
}
