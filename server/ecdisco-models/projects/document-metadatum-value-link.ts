import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import { defaultTransform, ModelBase } from '../general/model-base';
import { DocumentMetadatumValue } from './document-metadatum-value';

export class DocumentMetadatumValueLink extends ModelBase {
  @prop()
  documentMetadataValue: string;
  @prop()
  documentMetadataValueId: number;
  @prop()
  documentMetadatumValues: DocumentMetadatumValue[];
  @prop()
  metadataId: number;

  @prop()
  documentId: number;

  constructor() {
    super();
    this.documentMetadatumValues = [];
  }
}

export const DocumentMetadatumValueLinkModel = getModelForClass(
  DocumentMetadatumValueLink,
  defaultTransform,
);
