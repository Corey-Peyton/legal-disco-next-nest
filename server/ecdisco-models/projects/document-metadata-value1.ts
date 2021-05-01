import { prop } from '@typegoose/typegoose';
import { ModelBase } from '../general/model-base';
import { DocumentMetadataValue } from './document-metadata-value';

export class DocumentMetadataValue1 extends ModelBase {
  @prop()
  documentMetadataValue: string;
  @prop()
  documentMetadataValueId: number;
  @prop()
  documentMetadataValues: DocumentMetadataValue[];
  @prop()
  metadataId: number;
  constructor() {
    super();
    this.documentMetadataValues = [];
  }
}
