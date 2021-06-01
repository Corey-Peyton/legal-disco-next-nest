import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { Document } from '../../api/document';
import { DatasourceType } from '../enums/datasource-type';
import { defaultTransform, ModelBase } from '../general/model-base';
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

const DatasourceModel = getModelForClass(Datasource, defaultTransform);
export { DatasourceModel };
