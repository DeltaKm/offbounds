import { Module } from '@nestjs/common';
import { KycController } from './kyc.controller';
import { KycService } from './kyc.service';
import { IdentyfyService } from './identyfy.service';

@Module({
  controllers: [KycController],
  providers: [KycService, IdentyfyService],
  exports: [KycService],
})
export class KycModule {}
