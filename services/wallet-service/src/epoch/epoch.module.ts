import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EpochController } from './epoch.controller';
import { EpochService } from './epoch.service';
import { ConfigModule } from '../config/config.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [HttpModule, ConfigModule, PrismaModule],
  controllers: [EpochController],
  providers: [EpochService],
  exports: [EpochService],
})
export class EpochModule {}
