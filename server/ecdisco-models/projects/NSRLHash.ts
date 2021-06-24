import { prop } from '@typegoose/typegoose';
import { Connection } from 'mongoose';
import { getCommonModelForClass, ModelBase } from '../general/model-base';

export class NSRLHash extends ModelBase {
  @prop()
  documentHash: string[];
}

export const NSRLHashModel = (connection: Connection) => {
  return getCommonModelForClass(NSRLHash, connection);
};
