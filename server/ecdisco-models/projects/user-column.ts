import { getModelForClass, prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';

export class UserColumn extends ModelBase {
  @prop()
  userId: number;
  @prop()
  columnType: number;
  @prop()
  columnId: number;
}

const UserColumnModel = getModelForClass(UserColumn);
export { UserColumnModel };
