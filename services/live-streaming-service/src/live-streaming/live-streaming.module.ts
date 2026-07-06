import { Module } from '@nestjs/common';
import { LiveStreamingController } from './live-streaming.controller';
import { LiveStreamingService } from './live-streaming.service';

@Module({
  controllers: [LiveStreamingController],
  providers: [LiveStreamingService],
  exports: [LiveStreamingService],
})
export class LiveStreamingModule {}
