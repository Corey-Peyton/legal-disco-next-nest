import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { ObjectID } from 'mongodb';
import { Document } from '../../api/document';
import { defaultTransform, ModelBase } from '../general/model-base';
import { DocumentAnnotation } from './document-annotation';

export class DocumentAnnotationValue extends ModelBase {
  @prop()
  documentAnnotationId: ObjectID;

  @prop()
  documentId: ObjectID;

  @prop()
  pageId: ObjectID;

  @prop()
  value: string;

  @prop()
  document: Document;

  @prop()
  documentAnnotation: DocumentAnnotation;
}

export const DocumentAnnotationValueModel = getModelForClass(
  DocumentAnnotationValue,
  defaultTransform,
);
