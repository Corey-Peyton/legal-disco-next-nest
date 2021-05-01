import { prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';
import { Group } from './group';
import { Project } from './project';

export class ProjectGroup extends ModelBase {

  @prop()
  projectId: number;
  @prop()
  groupId: number;

  @prop()
  group: Group;
  @prop()
  project: Project;
}
