import { prop } from '@typegoose/typegoose';
import { ObjectID } from 'mongodb';
import { Connection } from 'mongoose';
import { getCommonModelForClass, ModelBase } from '../general/model-base';
import { DatabaseServer } from './database-server';
import { Datasources } from './datasource';
import { ProjectGroup } from './project-group';
import { ProjectUser } from './project-user';

export class Project extends ModelBase {
  @prop()
  databaseServer?: DatabaseServer;
  @prop()
  databaseServerId?: ObjectID;
  @prop()
  datasource?: Datasources[];

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
