import { Mongoose } from 'mongoose';
import { MasterController } from '../master/master-controller';
import { ProjectContext } from '../master/project-context';

export class ProjectBaseController extends MasterController {
  projectId: number;

  get projectContext(): Mongoose {
    if (this.m_projectContext === null) {
      this.m_projectContext = new ProjectContext().context;
    }

    return this.m_projectContext;
  }

  private m_projectContext: Mongoose;
}
