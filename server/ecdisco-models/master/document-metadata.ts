import { prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';

export class DocumentMetadata extends ModelBase {

  @prop()
  name: string;
}
