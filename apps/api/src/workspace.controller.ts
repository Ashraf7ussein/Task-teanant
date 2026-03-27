import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
} from '@nestjs/common';
import { prisma } from './prisma';

@Controller()
export class WorkspaceController {
  @Post('demo/bootstrap')
  async bootstrapDemo() {
    const tenants = [
      {
        name: 'Acme Studio',
        projects: [
          {
            name: 'Marketing Site',
            tasks: ['Draft hero copy', 'Ship pricing section', 'Review analytics'],
          },
          {
            name: 'Customer Portal',
            tasks: ['Fix invoice screen', 'Add export button'],
          },
        ],
      },
      {
        name: 'Blue Logistics',
        projects: [
          {
            name: 'Dispatch Board',
            tasks: ['Confirm route batches', 'Call delayed drivers'],
          },
          {
            name: 'Warehouse Ops',
            tasks: ['Cycle count aisle C', 'Print return labels'],
          },
        ],
      },
    ];

    for (const tenantSeed of tenants) {
      let tenant = await prisma.tenant.findFirst({
        where: { name: tenantSeed.name },
      });

      if (!tenant) {
        tenant = await prisma.tenant.create({
          data: { name: tenantSeed.name },
        });
      }

      for (const projectSeed of tenantSeed.projects) {
        let project = await prisma.project.findFirst({
          where: {
            tenantId: tenant.id,
            name: projectSeed.name,
          },
        });

        if (!project) {
          project = await prisma.project.create({
            data: {
              name: projectSeed.name,
              tenantId: tenant.id,
            },
          });
        }

        const existingTaskCount = await prisma.task.count({
          where: { projectId: project.id },
        });

        if (existingTaskCount === 0) {
          await prisma.task.createMany({
            data: projectSeed.tasks.map((title, index) => ({
              title,
              completed: index === 0,
              projectId: project.id,
            })),
          });
        }
      }
    }

    const totalTenants = await prisma.tenant.count();
    const totalProjects = await prisma.project.count();
    const totalTasks = await prisma.task.count();

    return {
      tenants: totalTenants,
      projects: totalProjects,
      tasks: totalTasks,
    };
  }

  @Get('tenants')
  async getTenants() {
    return prisma.tenant.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  @Get('projects')
  async getProjects(@Headers('x-tenant-id') tenantId?: string) {
    if (!tenantId) {
      throw new BadRequestException('x-tenant-id header is required');
    }

    return prisma.project.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        tenantId: true,
        _count: {
          select: { tasks: true },
        },
      },
    });
  }
}