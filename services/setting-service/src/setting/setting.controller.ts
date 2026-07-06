import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SettingService } from './setting.service';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Controller('setting')
@UseGuards(JwtAuthGuard)
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  @Post()
  upsert(@Request() req: { user: { sub: string } }, @Body() dto: UpdateSettingDto) {
    return this.settingService.upsert(req.user.sub, dto);
  }

  @Get(':key')
  findByKey(@Request() req: { user: { sub: string } }, @Param('key') key: string) {
    return this.settingService.findByKey(req.user.sub, key);
  }

  @Get()
  findByUser(@Request() req: { user: { sub: string } }) {
    return this.settingService.findByUser(req.user.sub);
  }

  @Delete(':key')
  delete(@Request() req: { user: { sub: string } }, @Param('key') key: string) {
    return this.settingService.delete(req.user.sub, key);
  }
}
