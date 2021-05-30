import { getModelForClass, prop } from '@typegoose/typegoose';
import { Document } from '../../api/document';
import { DefaultTransform, ModelBase } from '../general/model-base';
import { DocumentAnnotation } from './document-annotation';

export class DocumentAnnotationValue extends ModelBase {

  @prop()
  documentAnnotationId: number;
  @prop()
  documentId: number;
  @prop()
  pageId: number;
  @prop()
  value: string;
  @prop()
  document: Document;
  @prop()
  documentAnnotation: DocumentAnnotation;
}

const DocumentAnnotationValueModel = getModelForClass(DocumentAnnotationValue, DefaultTransform);
export { DocumentAnnotationValueModel };
