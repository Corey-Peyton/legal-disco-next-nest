import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { defaultTransform, ModelBase } from '../general/model-base';

export class UserColumn extends ModelBase {
  @prop()
  userId: number;
  @prop()
  columnType: number;
  @prop()
  columnId: number;
}

export const UserColumnModel = getModelForClass(UserColumn, defaultTransform);
