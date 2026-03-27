// apps/api/src/board/board.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class BoardService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, workspaceId: string) {
    return this.prisma.board.create({
      data: { name, workspaceId },
    });
  }

  async findAll(workspaceId: string) {
    return this.prisma.board.findMany({
      where: { workspaceId },
    });
  }

  async findOne(id: string) {
    return this.prisma.board.findUnique({ where: { id } });
  }

  async update(id: string, name: string) {
    return this.prisma.board.update({
      where: { id },
      data: { name },
    });
  }

  async remove(id: string) {
    return this.prisma.board.delete({ where: { id } });
  }
}