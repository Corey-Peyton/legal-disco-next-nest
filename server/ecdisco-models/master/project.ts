import { DatabaseServer } from './database-server';
import { Datasource } from './datasource';
import { ProjectGroup } from './project-group';
import { ProjectUser } from './project-user';
import { prop, getModelForClass, ReturnModelType, modelOptions } from '@typegoose/typegoose';
import { defaultTransform, ModelBase } from '../general/model-base';
import { ObjectID } from 'mongodb';
import { Connection } from 'mongoose';
import { BeAnObject } from '@typegoose/typegoose/lib/types';


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
  constructor() {
    super();
    this.projectGroups = [];
    this.projectUsers = [];
  }
}

const ProjectModel = (
  connection: Connection,
): ReturnModelType<typeof Project, BeAnObject> => {
  return getModelForClass(Project, {
    ...defaultTransform,
    ...{
      existingConnection: connection,
    },
  });
};
export { ProjectModel };
