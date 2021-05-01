import { DatabaseServer } from './database-server';
import { Datasource } from './datasource';
import { ProjectGroup } from './project-group';
import { ProjectUser } from './project-user';
import { prop, getModelForClass } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';

export class Project extends ModelBase {
  @prop()
  databaseServer: DatabaseServer;
  @prop()
  databaseServerId: number;
  @prop()
  datasource: Datasource[];

  @prop()
  name: string;
  @prop()
  projectGroups: ProjectGroup[];
  @prop()
  projectUsers: ProjectUser[];
  constructor() {
    super();
    this.projectGroups = [];
    this.projectUsers = [];
  }
}

const ProjectModel = getModelForClass(Project);
export { ProjectModel };
