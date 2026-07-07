import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SocialActivityController } from './social-activity.controller';
import { SocialActivityService } from './social-activity.service';

@Module({
  imports: [HttpModule],
  controllers: [SocialActivityController],
  providers: [SocialActivityService],
  exports: [SocialActivityService],
})
export class SocialActivityModule {}
