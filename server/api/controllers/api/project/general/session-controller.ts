import { Controller, Post } from '@nestjs/common';
import { ProjectBaseController } from '../project-base-controller';

@Controller('Session')
export class SessionController extends ProjectBaseController {

  @Post('clear')
  clear(): void {
    const dbContext =
      this.projectId === 0 ? this.masterContext : this.projectContext;

    dbContext.connection.db.collections(function (e, cols) {
      cols.forEach(function (col) {
        if (col.collectionName.startsWith(`Temp_Session[_]${this.sessionId}`)) {
          console.log(col.drop());
        }
      });
    });
  }
}
