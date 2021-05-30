import { getModelForClass, prop } from '@typegoose/typegoose';
import { DefaultTransform, ModelBase } from '../general/model-base';

export class UserColumn extends ModelBase {
  @prop()
  userId: number;
  @prop()
  columnType: number;
  @prop()
  columnId: number;
}

const UserColumnModel = getModelForClass(UserColumn, DefaultTransform);
export { UserColumnModel };
