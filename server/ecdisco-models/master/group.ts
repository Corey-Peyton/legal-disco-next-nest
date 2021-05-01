import { prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';
import { GroupUser } from './group-user';
import { ProjectGroup } from './project-group';

export class Group extends ModelBase {
  @prop()
  groupUsers: GroupUser[];

  @prop()
  name: string;
  @prop()
  projectGroups: ProjectGroup[];
  constructor() {
    super();
    this.groupUsers = [];
    this.projectGroups = [];
  }
}
