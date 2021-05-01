import { prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';
import { AppUser } from './app-user';
import { Group } from './group';

export class GroupUser extends ModelBase {

  @prop()
  groupId: number;
  @prop()
  userId: number;
  @prop()
  group: Group;
  @prop()
  user: AppUser;
}
