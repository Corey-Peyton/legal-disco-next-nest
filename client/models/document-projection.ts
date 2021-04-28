import { Document } from './document';
import { DocumentFieldTextValue } from './document-dield-text-value';
import { DocumentFieldBooleanValue } from './document-field-boolean-value';
import { DocumentFieldDateValue } from './document-field-date-value';
import { DocumentFieldNumberValue } from './document-field-number-value';

export interface DocumentProjection {
    booleanField: DocumentFieldBooleanValue;
    dateField: DocumentFieldDateValue;
    document: Document;
    numberField: DocumentFieldNumberValue;
    textField: DocumentFieldTextValue;
}
