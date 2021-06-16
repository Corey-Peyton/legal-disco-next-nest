import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { defaultTransform, ModelBase } from '../general/model-base';

export class DocumentMetadatum extends ModelBase {
  @prop()
  name: string;
}

export const DocumentMetadatumModel = getModelForClass(
  DocumentMetadatum,
  defaultTransform,
);
