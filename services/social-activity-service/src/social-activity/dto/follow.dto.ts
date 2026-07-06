import { IsNotEmpty, IsUUID } from 'class-validator';

export class FollowDto {
  @IsUUID()
  @IsNotEmpty()
  followingId: string;
}
