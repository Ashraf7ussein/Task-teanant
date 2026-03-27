// apps/api/src/board/board.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Headers } from '@nestjs/common';
import { BoardService } from './board.service';

@Controller('boards')
export class BoardController {
  constructor(private boardService: BoardService) {}

  @Post()
  create(@Body('name') name: string, @Headers('x-workspace-id') workspaceId: string) {
    return this.boardService.create(name, workspaceId);
  }

  @Get()
  findAll(@Headers('x-workspace-id') workspaceId: string) {
    return this.boardService.findAll(workspaceId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.boardService.update(id, name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardService.remove(id);
  }
}