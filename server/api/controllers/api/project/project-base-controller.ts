import { ObjectID } from 'bson';
import { Connection } from 'mongoose';
import { MasterBaseController } from '../master/master-base-controller';
import { MasterController } from '../master/master-controller';
import { ProjectContext } from '../master/project-context';

export class ProjectBaseController extends MasterController {

  get masterContext(): Promise<Connection> {
    return new MasterBaseController().masterContext;
  }

  projectContext(projectId): Promise<Connection> {
    return new ProjectContext(projectId).context;
  }
}
