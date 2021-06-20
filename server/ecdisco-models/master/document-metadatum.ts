import { prop } from '@typegoose/typegoose';
import { Connection } from 'mongoose';
import { getCommonModelForClass, ModelBase } from '../general/model-base';

export class DocumentMetadatum extends ModelBase {
  @prop()
  name: string;
}

export const DocumentMetadatumModel = (connection: Connection) => {
  return getCommonModelForClass(DocumentMetadatum, connection);
};