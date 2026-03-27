import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ListService } from './list.service';

@Controller('lists')
export class ListController {
  constructor(private listService: ListService) {}

  @Post()
  create(@Body() body: { name: string; boardId: string; order: number }) {
    return this.listService.create(body.name, body.boardId, body.order);
  }

  @Get()
  findAll(@Query('boardId') boardId: string) {
    return this.listService.findAll(boardId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.listService.update(id, name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listService.remove(id);
  }
}