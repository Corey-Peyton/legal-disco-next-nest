import {
  getModelForClass,
  modelOptions,
  prop,
  ReturnModelType,
} from '@typegoose/typegoose';
import { BeAnObject } from '@typegoose/typegoose/lib/types';
import { ObjectID } from 'bson';
import { Document } from '../../api/document';
import { defaultTransform, ModelBase } from '../general/model-base';
import { documentFieldTableNamePrefix } from './document-field';
// TODO: DOn't need seperate class. we can use combine with other Documentfieldvalue. Do for all. Not writing TODO comment to all.

export class DocumentFieldDateValue extends ModelBase {
  @prop()
  documentId: number;
  @prop()
  value: Date;
  @prop()
  document: Document;
}

export const DocumentFieldDateValueModel = (
  fieldId: ObjectID,
): ReturnModelType<typeof DocumentFieldDateValue, BeAnObject> => {
  return getModelForClass(DocumentFieldDateValue, {
    ...defaultTransform,
    ...{
      schemaOptions: {
        collection: `${documentFieldTableNamePrefix}${fieldId}`,
      },
    },
  });
};
