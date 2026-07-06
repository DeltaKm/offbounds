import { Module } from '@nestjs/common';
import { DashboardCreatorController } from './dashboard-creator.controller';
import { DashboardCreatorService } from './dashboard-creator.service';

@Module({
  controllers: [DashboardCreatorController],
  providers: [DashboardCreatorService],
  exports: [DashboardCreatorService],
})
export class DashboardCreatorModule {}
