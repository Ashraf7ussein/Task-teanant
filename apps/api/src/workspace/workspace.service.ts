// apps/api/src/workspace/workspace.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(private prisma: PrismaService) {}

  async create(name: string) {
    return this.prisma.workspace.create({
      data: { name },
    });
  }

  async findAll() {
    return this.prisma.workspace.findMany();
  }

  async findOne(id: string) {
    return this.prisma.workspace.findUnique({
      where: { id },
    });
  }

  async update(id: string, name: string) {
    return this.prisma.workspace.update({
      where: { id },
      data: { name },
    });
  }

  async remove(id: string) {
    return this.prisma.workspace.delete({
      where: { id },
    });
  }
}