import { prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';
import { Datasources } from './datasource';

export class DatasourceType extends ModelBase {
  @prop()
  datasources: Datasources[];

  @prop()
  name: string;
  constructor() {
    super();
    this.datasources = [];
  }
}
