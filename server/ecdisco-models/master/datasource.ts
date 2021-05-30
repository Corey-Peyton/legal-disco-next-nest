import { getModelForClass, prop } from '@typegoose/typegoose';
import { DatasourceType } from '../enums/datasource-type';
import { DefaultTransform, ModelBase } from '../general/model-base';

export class Datasource extends ModelBase {

  @prop()
  name: string;
  @prop()
  datasourceTypeId: number;
  @prop()
  datasourceType: DatasourceType;
}

const datasourceModel = getModelForClass(Datasource, DefaultTransform);
export { datasourceModel };
