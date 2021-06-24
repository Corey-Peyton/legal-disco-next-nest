import { prop } from '@typegoose/typegoose';
import { ObjectID } from 'bson';
import { Connection } from 'mongoose';
import { getCommonModelForClass, ModelBase } from '../general/model-base';

export class Folder extends ModelBase {
  @prop()
  parentDocumentId: ObjectID;

  @prop()
  parentFolderId: ObjectID;

  @prop()
  name: string;
}

export const FolderModel = (connection: Connection) => {
  return getCommonModelForClass(Folder, connection);
};
