import { prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';
import { AppUser } from './app-user';
import { Project } from './project';

export class ProjectUser extends ModelBase {

  @prop()
  projectId: number;
  @prop()
  userId: number;
  @prop()
  project: Project;
  @prop()
  user: AppUser;
}
