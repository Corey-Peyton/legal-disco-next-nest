import { prop } from '@typegoose/typegoose';
import { MasterContext } from '~/api/controllers/api/master/master-context';
import { getCommonModelForClass, ModelBase } from '../general/model-base';
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

const DatabaseServerModel = async () => { 
  return getCommonModelForClass(DatabaseServer, await new MasterContext().context); 
};
export { DatabaseServerModel };
