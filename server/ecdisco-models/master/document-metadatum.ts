import { getModelForClass, prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';

export class DocumentMetadatum extends ModelBase {

  @prop()
  name: string;
}

const DocumentMetadatumModel = getModelForClass(DocumentMetadatum);
export { DocumentMetadatumModel };
