import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksController } from './tasks/tasks.controller';
import { WorkspaceController } from './workspace.controller';

@Module({
  imports: [],
  controllers: [AppController, TasksController, WorkspaceController],
  providers: [AppService],
})
export class AppModule {}
