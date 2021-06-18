import {
  prop,
  Ref
} from '@typegoose/typegoose';
import { ObjectID } from 'bson';
import { Connection } from 'mongoose';
import { getCommonModelForClass, ModelBase } from '../general/model-base';
import { Datasources } from '../master/datasource';
import { DocumentAnnotationValue } from './document-annotation-value';
import { DocumentFieldBooleanValue } from './document-field-boolean-value';
import { DocumentFieldDateValue } from './document-field-date-value';
import { DocumentFieldNumberValue } from './document-field-number-value';
import { DocumentFieldTextValue } from './document-field-text-value';
import { DocumentMetadatumValue } from './document-metadatum-value';

export class Document extends ModelBase {
  @prop()
  childrenDocument: Ref<Document>[];
  @prop()
  content: string;
  @prop()
  datasource: Datasources;
  @prop()
  datasourceId: ObjectID;
  @prop()
  documentAnnotationValues: DocumentAnnotationValue[];
  @prop()
  documentFieldBooleanValues: DocumentFieldBooleanValue[];
  @prop()
  documentFieldDateValues: DocumentFieldDateValue[];
  @prop()
  documentFieldNumberValues: DocumentFieldNumberValue[];
  @prop()
  documentFieldTextValues: DocumentFieldTextValue[];
  @prop()
  documentMetadatumValues: DocumentMetadatumValue[];
  @prop()
  fileExtension: string;
  @prop()
  fileName: string;

  @prop()
  parentDocument: Ref<Document>;
  @prop()
  parentDocumentId: ObjectID;
  constructor() {
    super();
    this.documentAnnotationValues = [];
    this.documentFieldBooleanValues = [];
    this.documentFieldDateValues = [];
    this.documentFieldNumberValues = [];
    this.documentFieldTextValues = [];
    this.documentMetadatumValues = [];
    this.childrenDocument = [];
  }
}

export const DocumentModel = (connection: Connection) => {
  return getCommonModelForClass(Document, connection);
};