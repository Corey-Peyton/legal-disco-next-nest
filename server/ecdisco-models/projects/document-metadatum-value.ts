import { prop } from '@typegoose/typegoose';
import { Document } from '../../api/document';
import { ModelBase } from '../general/model-base';
import { DocumentMetadatumValueLink } from './document-metadatum-value-link';

export class DocumentMetadatumValue extends ModelBase {

  @prop()
  documentId: number;
  @prop()
  documentMetadataValueId: number;
  @prop()
  document: Document;
  @prop()
  documentMetadataValue: DocumentMetadatumValueLink;
}
