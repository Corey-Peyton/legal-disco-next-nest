import { getModelForClass, prop, ReturnModelType } from '@typegoose/typegoose';
import { BeAnObject } from '@typegoose/typegoose/lib/types';
import { Document } from '../../api/document';
import { ModelBase } from '../general/model-base';
import { documentFieldTableNamePrefix } from './document-field';

export class DocumentFieldNumberValue extends ModelBase {

  @prop()
  documentId: number;
  @prop()
  value: number;
  @prop()
  document: Document;
}

const DocumentFieldNumberValueModel = (
  fieldId: number
): ReturnModelType<typeof DocumentFieldNumberValue, BeAnObject> => {
  return getModelForClass(DocumentFieldNumberValue, {
    schemaOptions: { collection: `${documentFieldTableNamePrefix}${fieldId}` },
  });
};

export { DocumentFieldNumberValueModel };
