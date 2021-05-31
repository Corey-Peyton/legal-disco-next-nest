import { ObjectID } from 'bson';
import { Connection } from 'mongoose';
import { MasterBaseController } from '../master/master-base-controller';
import { MasterController } from '../master/master-controller';
import { ProjectContext } from '../master/project-context';

export class ProjectBaseController extends MasterController {
  projectId: ObjectID;

  get masterContext(): Promise<Connection> {
    return new MasterBaseController().masterContext;
  }

  get projectContext(): Promise<Connection> {
    if (!this.m_projectContext) {
      this.m_projectContext = new ProjectContext(this.projectId).context;
    }

    return this.m_projectContext;
  }

  private m_projectContext: Promise<Connection>;
}
