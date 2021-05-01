import { prop } from '@typegoose/typegoose';
import { Document } from '../../api/document';
import { ModelBase } from '../general/model-base';
import { DocumentMetadataValue1 } from './document-metadata-value1';

export class DocumentMetadataValue extends ModelBase {

  @prop()
  documentId: number;

  @prop()
  documentMetadataValueId: number;
  @prop()
  document: Document;
  @prop()
  documentMetadataValueNavigation: DocumentMetadataValue1;
}
