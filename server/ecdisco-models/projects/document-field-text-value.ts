import { getModelForClass, modelOptions, prop, ReturnModelType } from '@typegoose/typegoose';
import { BeAnObject } from '@typegoose/typegoose/lib/types';
import { ObjectID } from 'bson';
import { Document } from '../../api/document';
import { defaultTransform, ModelBase } from '../general/model-base';
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
  fieldId: ObjectID
): ReturnModelType<typeof DocumentFieldTextValue, BeAnObject> => {
  return getModelForClass(DocumentFieldTextValue, {
    ...defaultTransform,
    ...{
      schemaOptions: {
        collection: `${documentFieldTableNamePrefix}${fieldId}`,
      },
    },
  });
};

export { DocumentFieldTextValueModel };
