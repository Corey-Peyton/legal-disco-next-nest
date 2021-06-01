import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { defaultTransform, ModelBase } from '../general/model-base';
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
  DocumentAnnotationValueMultiPage, defaultTransform
);
export { DocumentAnnotationValueMultiPageModel };
