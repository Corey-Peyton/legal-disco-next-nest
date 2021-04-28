import { Document } from './document';

export interface DocumentFieldObjectReferenceValue {
    document: Document;
    documentId: number;
    id: number;
    objectReferenceType: number;
    value: number;
}
