import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Dashboard, DashboardWidget } from '@prisma/client';

@Injectable()
export class DashboardCreatorService {
  constructor(private readonly prisma: PrismaService) {}

  async createDashboard(userId: string, data: {
    name: string;
    description?: string;
    layout: unknown;
    isPublic?: boolean;
  }): Promise<Dashboard> {
    return this.prisma.dashboard.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
        layout: data.layout as never,
        isPublic: data.isPublic ?? false,
      },
    });
  }

  async getDashboard(id: string, userId: string): Promise<Dashboard> {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, userId },
      include: { widgets: true },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }
    return dashboard;
  }

  async getDashboardsByUser(userId: string): Promise<Dashboard[]> {
    return this.prisma.dashboard.findMany({
      where: { userId },
      include: { widgets: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async updateDashboard(id: string, userId: string, data: {
    name?: string;
    description?: string;
    layout?: unknown;
    isPublic?: boolean;
  }): Promise<Dashboard> {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, userId },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.prisma.dashboard.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        layout: data.layout as never,
        isPublic: data.isPublic,
      },
    });
  }

  async deleteDashboard(id: string, userId: string): Promise<void> {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id, userId },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    await this.prisma.dashboard.delete({
      where: { id },
    });
  }

  async addWidget(dashboardId: string, userId: string, data: {
    type: string;
    config: unknown;
    position: unknown;
    size: unknown;
  }): Promise<DashboardWidget> {
    const dashboard = await this.prisma.dashboard.findFirst({
      where: { id: dashboardId, userId },
    });
    if (!dashboard) {
      throw new NotFoundException('Dashboard not found');
    }

    return this.prisma.dashboardWidget.create({
      data: {
        dashboardId,
        type: data.type,
        config: data.config as never,
        position: data.position as never,
        size: data.size as never,
      },
    });
  }

  async updateWidget(id: string, userId: string, data: {
    config?: unknown;
    position?: unknown;
    size?: unknown;
  }): Promise<DashboardWidget> {
    const widget = await this.prisma.dashboardWidget.findFirst({
      where: { id },
      include: { dashboard: true },
    });
    if (!widget || widget.dashboard.userId !== userId) {
      throw new NotFoundException('Widget not found');
    }

    return this.prisma.dashboardWidget.update({
      where: { id },
      data: {
        config: data.config as never,
        position: data.position as never,
        size: data.size as never,
      },
    });
  }

  async deleteWidget(id: string, userId: string): Promise<void> {
    const widget = await this.prisma.dashboardWidget.findFirst({
      where: { id },
      include: { dashboard: true },
    });
    if (!widget || widget.dashboard.userId !== userId) {
      throw new NotFoundException('Widget not found');
    }

    await this.prisma.dashboardWidget.delete({
      where: { id },
    });
  }
}
