import { getModelForClass, prop } from '@typegoose/typegoose';
import { DefaultTransform, ModelBase } from '../general/model-base';
import { DocumentAnnotation } from './document-annotation';

export class DocumentAnnotationValueMultiPage extends ModelBase {

  @prop()
  documentAnnotationId: number;
  @prop()
  value: string;
  @prop()
  documentAnnotation: DocumentAnnotation;
}

const DocumentAnnotationValueMultiPageModel = getModelForClass(
  DocumentAnnotationValueMultiPage, DefaultTransform
);
export { DocumentAnnotationValueMultiPageModel };
