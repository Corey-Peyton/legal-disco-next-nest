import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { defaultTransform, ModelBase } from '../general/model-base';
import { Project } from './project';


export class DatabaseServer extends ModelBase {

  @prop()
  name?: string;

  @prop()
  projects?: Project[];

  constructor() {
    super();
    this.projects = [];
  }
}

const DatabaseServerModel = getModelForClass(DatabaseServer, defaultTransform);
export { DatabaseServerModel };
