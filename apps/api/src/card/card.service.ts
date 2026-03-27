import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CardService {
  constructor(private prisma: PrismaService) {}

  async create(title: string, listId: string, order: number) {
    return this.prisma.card.create({
      data: { title, listId, order },
    });
  }

  async findAll(listId: string) {
    return this.prisma.card.findMany({
      where: { listId },
      orderBy: { order: 'asc' },
    });
  }

  async update(id: string, data: { title?: string; content?: string }) {
    return this.prisma.card.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.card.delete({ where: { id } });
  }
}