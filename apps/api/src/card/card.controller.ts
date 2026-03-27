// apps/api/src/board/board.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Headers } from '@nestjs/common';
import { CardService } from './card.service';

@Controller('cards')
export class CardController {
  constructor(private cardService: CardService) {}

  @Post()
  create(@Body() body: { title: string; listId: string; order: number }) {
    return this.cardService.create(body.title, body.listId, body.order);
  }

  @Get()
  findAll(@Body('listId') listId: string) {
    return this.cardService.findAll(listId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: { title?: string; content?: string }) {
    return this.cardService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cardService.remove(id);
  }
}