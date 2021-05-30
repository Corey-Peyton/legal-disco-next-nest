import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { DefaultTransform, ModelBase } from '../general/model-base';
import { ProductionAnnotationFilter } from './production-annotation-filter';
import { Query } from './query';

export class Production extends ModelBase {
  @prop()
  childrenProduction: Ref<Production>[];

  @prop()
  includeImage: boolean;
  @prop()
  includeNative: boolean;
  @prop()
  name: string;
  @prop()
  parentProduction: Ref<Production>;
  @prop()
  parentProductionId: number;
  @prop()
  productionAnnotationFilters: Ref<ProductionAnnotationFilter>[];
  @prop()
  query: Query;
  @prop()
  queryId: number;
  constructor() {
    super();
    this.childrenProduction = [];
    this.productionAnnotationFilters = [];
  }
}

const ProductionModel = getModelForClass(Production, DefaultTransform);
export { ProductionModel };
