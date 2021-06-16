import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from '@typegoose/typegoose';
import { defaultTransform, ModelBase } from '../general/model-base';
import { DocumentAnnotationValue } from './document-annotation-value';
import { DocumentAnnotationValueMultiPage } from './document-annotation-value-multi-page';
import { ProductionAnnotationFilter } from './production-annotation-filter';

export class DocumentAnnotation extends ModelBase {
  @prop()
  children: Ref<DocumentAnnotation>[];
  @prop()
  documentAnnotationValueMultiPages: DocumentAnnotationValueMultiPage[];
  @prop()
  documentAnnotationValues: DocumentAnnotationValue[];

  @prop()
  isMultiPage: boolean;
  @prop()
  name: string;
  @prop()
  parent: Ref<DocumentAnnotation>;
  @prop()
  parentId: number;
  @prop()
  productionAnnotationFilters: ProductionAnnotationFilter[];
  constructor() {
    super();
    this.documentAnnotationValueMultiPages = [];
    this.documentAnnotationValues = [];
    this.children = [];
    this.productionAnnotationFilters = [];
  }
}

export const DocumentAnnotationModel = getModelForClass(
  DocumentAnnotation,
  defaultTransform,
);
