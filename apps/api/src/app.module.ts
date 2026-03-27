import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from 'prisma/prisma.service';
import { WorkspaceController } from './workspace/workspace.controller';
import { WorkspaceService } from './workspace/workspace.service';
import { BoardService } from './board/board.service';
import { BoardController } from './board/board.controller';
import { ListController } from './list/list.controller';
import { ListService } from './list/list.service';

@Module({
  imports: [],
   controllers: [AppController, WorkspaceController, BoardController, ListController],
  providers: [AppService, PrismaService, WorkspaceService, BoardService, ListService],
})
export class AppModule {}
