import { prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';
import { Datasource } from './datasource';

export class DatasourceType extends ModelBase {
  @prop()
  datasources: Datasource[];

  @prop()
  name: string;
  constructor() {
    super();
    this.datasources = [];
  }
}
