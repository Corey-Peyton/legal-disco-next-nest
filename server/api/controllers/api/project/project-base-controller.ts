import { ObjectID } from 'bson';
import { Mongoose } from 'mongoose';
import { MasterBaseController } from '../master/master-base-controller';
import { MasterController } from '../master/master-controller';
import { ProjectContext } from '../master/project-context';

export class ProjectBaseController extends MasterController {
  projectId: ObjectID;

  get masterContext(): Mongoose {
    return new MasterBaseController().masterContext;
  }

  get projectContext(): Mongoose {
    if (!this.m_projectContext) {
      this.m_projectContext = new ProjectContext(this.projectId).context;
    }

    return this.m_projectContext;
  }

  private m_projectContext: Mongoose;
}
