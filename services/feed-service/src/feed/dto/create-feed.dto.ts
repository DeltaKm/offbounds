import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { FeedContentType } from '../feed.constants';

export class CreateFeedDto {
  @IsString()
  @IsNotEmpty()
  contentId!: string;

  @IsEnum(FeedContentType)
  contentType!: FeedContentType;
}
