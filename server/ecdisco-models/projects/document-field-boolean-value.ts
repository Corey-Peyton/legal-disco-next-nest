import { getModelForClass, prop, ReturnModelType } from '@typegoose/typegoose';
import { BeAnObject } from '@typegoose/typegoose/lib/types';
import { Document } from '../../api/document';
import { ModelBase } from '../general/model-base';
import { documentFieldTableNamePrefix } from './document-field';

export class DocumentFieldBooleanValue extends ModelBase {

  @prop()
  documentId: number;
  @prop()
  document: Document;
}

// TODO: ONly Pass id and build collection name.
const DocumentFieldBooleanValueModel = (
  fieldId: number
): ReturnModelType<typeof DocumentFieldBooleanValue, BeAnObject> => {
  return getModelForClass(DocumentFieldBooleanValue, {
    schemaOptions: { collection: `${documentFieldTableNamePrefix}${fieldId}` },
  });
};

export { DocumentFieldBooleanValueModel };
