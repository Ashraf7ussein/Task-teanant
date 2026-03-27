import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ListService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, boardId: string, order: number) {
    return this.prisma.list.create({
      data: { name, boardId, order },
    });
  }

  async findAll(boardId: string) {
    return this.prisma.list.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
    });
  }

  async update(id: string, name: string) {
    return this.prisma.list.update({
      where: { id },
      data: { name },
    });
  }

  async remove(id: string) {
    return this.prisma.list.delete({ where: { id } });
  }
}