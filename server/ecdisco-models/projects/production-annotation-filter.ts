import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Query } from 'express-serve-static-core';
import { defaultTransform, ModelBase } from '../general/model-base';
import { DocumentAnnotation } from './document-annotation';
import { Production } from './production';


export class ProductionAnnotationFilter extends ModelBase {

  @prop()
  productionId: number;
  @prop()
  queryId: number;

  @prop()
  annotationId: number;

  @prop()
  annotation: DocumentAnnotation;
  @prop()
  production: Production;
  @prop()
  query: Query;
}

export const ProductionAnnotationFilterModel = getModelForClass(
  ProductionAnnotationFilter, defaultTransform
);
