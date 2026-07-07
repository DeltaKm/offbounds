import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto, UpdateSettingDto } from './dto/settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getAll() {
    return this.settingsService.getAll();
  }

  @Get(':key')
  async getByKey(@Param('key') key: string) {
    return this.settingsService.getByKey(key);
  }

  @Post()
  async create(@Body() dto: CreateSettingDto) {
    return this.settingsService.create(dto);
  }

  @Put(':key')
  async update(@Param('key') key: string, @Body() dto: UpdateSettingDto) {
    return this.settingsService.update(key, dto);
  }
}
