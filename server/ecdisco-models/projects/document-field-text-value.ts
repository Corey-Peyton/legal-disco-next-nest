import { getModelForClass, prop, ReturnModelType } from '@typegoose/typegoose';
import { BeAnObject } from '@typegoose/typegoose/lib/types';
import { Document } from '../../api/document';
import { ModelBase } from '../general/model-base';
import { documentFieldTableNamePrefix } from './document-field';

export class DocumentFieldTextValue extends ModelBase {

  @prop()
  fieldId: number;
  @prop()
  documentId: number;
  @prop()
  value: string;

  @prop()
  document: Document;
}

const DocumentFieldTextValueModel = (
  fieldId: number
): ReturnModelType<typeof DocumentFieldTextValue, BeAnObject> => {
  return getModelForClass(DocumentFieldTextValue, {
    schemaOptions: { collection: `${documentFieldTableNamePrefix}${fieldId}` },
  });
};

export { DocumentFieldTextValueModel };
