import { getModelForClass, modelOptions, prop, ReturnModelType } from '@typegoose/typegoose';
import { BeAnObject } from '@typegoose/typegoose/lib/types';
import { Connection } from 'mongoose';
import { DatasourceType } from '../enums/datasource-type';
import { defaultTransform, ModelBase } from '../general/model-base';


export class Datasource extends ModelBase {

  @prop()
  name: string;
  @prop()
  datasourceTypeId: number;
  @prop()
  datasourceType: DatasourceType;
}

const datasourceModel = (
  connection: Connection,
): ReturnModelType<typeof Datasource, BeAnObject> => {
  return getModelForClass(Datasource, {
    ...defaultTransform,
    ...{
      existingConnection: connection,
    },
  });
};
export { datasourceModel };
