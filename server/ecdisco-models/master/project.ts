import { prop } from '@typegoose/typegoose';
import { ObjectID } from 'mongodb';
import { Connection } from 'mongoose';
import { getCommonModelForClass, ModelBase } from '../general/model-base';
import { Datasource } from '../projects/datasource';
import { DatabaseServer } from './database-server';
import { ProjectGroup } from './project-group';
import { ProjectUser } from './project-user';

export class Project extends ModelBase {
  @prop()
  databaseServer?: DatabaseServer;
  @prop()
  databaseServerId?: ObjectID;
  @prop()
  datasource?: Datasource[];

  @prop()
  name?: string;
  @prop()
  projectGroups?: ProjectGroup[];
  @prop()
  projectUsers?: ProjectUser[];
}

export const ProjectModel = (connection: Connection) => {
  return getCommonModelForClass(Project, connection);
};
