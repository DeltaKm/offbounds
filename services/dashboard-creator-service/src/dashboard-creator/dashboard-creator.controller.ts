import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardCreatorService } from './dashboard-creator.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardCreatorController {
  constructor(private readonly dashboardService: DashboardCreatorService) {}

  @Post()
  createDashboard(@Request() req: { user: { sub: string } }, @Body() data: {
    name: string;
    description?: string;
    layout: unknown;
    isPublic?: boolean;
  }) {
    return this.dashboardService.createDashboard(req.user.sub, data);
  }

  @Get(':id')
  getDashboard(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.dashboardService.getDashboard(id, req.user.sub);
  }

  @Get()
  getDashboards(@Request() req: { user: { sub: string } }) {
    return this.dashboardService.getDashboardsByUser(req.user.sub);
  }

  @Patch(':id')
  updateDashboard(
    @Request() req: { user: { sub: string } },
    @Param('id') id: string,
    @Body() data: {
      name?: string;
      description?: string;
      layout?: unknown;
      isPublic?: boolean;
    },
  ) {
    return this.dashboardService.updateDashboard(id, req.user.sub, data);
  }

  @Delete(':id')
  deleteDashboard(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.dashboardService.deleteDashboard(id, req.user.sub);
  }

  @Post(':dashboardId/widgets')
  addWidget(
    @Request() req: { user: { sub: string } },
    @Param('dashboardId') dashboardId: string,
    @Body() data: {
      type: string;
      config: unknown;
      position: unknown;
      size: unknown;
    },
  ) {
    return this.dashboardService.addWidget(dashboardId, req.user.sub, data);
  }

  @Patch('widgets/:id')
  updateWidget(
    @Request() req: { user: { sub: string } },
    @Param('id') id: string,
    @Body() data: {
      config?: unknown;
      position?: unknown;
      size?: unknown;
    },
  ) {
    return this.dashboardService.updateWidget(id, req.user.sub, data);
  }

  @Delete('widgets/:id')
  deleteWidget(@Request() req: { user: { sub: string } }, @Param('id') id: string) {
    return this.dashboardService.deleteWidget(id, req.user.sub);
  }
}
