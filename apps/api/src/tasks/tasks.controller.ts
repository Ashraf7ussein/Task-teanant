// apps/api/src/tasks/tasks.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { prisma } from '../prisma';

@Controller('tasks')
export class TasksController {
  // GET /tasks/project/:projectId
  @Get('project/:projectId')
  async getTasksForProject(
    @Param('projectId') projectId: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.tenantId !== tenantId) {
      throw new ForbiddenException('You cannot access another tenant\'s tasks');
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      orderBy: { updatedAt: 'desc' },
    });

    return tasks;
  }

  @Post()
  async createTask(
    @Body('title') title: string,
    @Body('projectId') projectId: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }

    if (!title?.trim()) {
      throw new BadRequestException('title is required');
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.tenantId !== tenantId) {
      throw new ForbiddenException('You cannot add tasks to another tenant project');
    }

    return prisma.task.create({
      data: {
        title: title.trim(),
        projectId,
      },
    });
  }

  @Patch(':id/toggle')
  async toggleTask(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.project.tenantId !== tenantId) {
      throw new ForbiddenException('You cannot update another tenant task');
    }

    return prisma.task.update({
      where: { id },
      data: { completed: !task.completed },
    });
  }
}