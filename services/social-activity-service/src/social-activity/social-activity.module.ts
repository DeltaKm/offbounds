import { Module } from '@nestjs/common';
import { SocialActivityController } from './social-activity.controller';
import { SocialActivityService } from './social-activity.service';

@Module({
  controllers: [SocialActivityController],
  providers: [SocialActivityService],
  exports: [SocialActivityService],
})
export class SocialActivityModule {}
