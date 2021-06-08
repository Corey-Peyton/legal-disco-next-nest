import { prop } from '@typegoose/typegoose';
import { Connection } from 'mongoose';
import { Document } from '../../api/document';
import { DatasourceType } from '../enums/datasource-type';
import { getCommonModelForClass, ModelBase } from '../general/model-base';
import { Project } from '../master/project';

export class Datasource extends ModelBase {
  @prop()
  authTokenId?: number;

  @prop()
  documents?: Document[];

  @prop()
  name: string;

  @prop()
  project?: Project;

  @prop()
  source?: number;

  @prop()
  type?: DatasourceType;

  filter?: string;

  constructor() {
    super();
    this.documents = [];
    this.project = new Project();
  }
}

export const DatasourceModel = (connection: Connection) => {
  return getCommonModelForClass(Datasource, connection);
};