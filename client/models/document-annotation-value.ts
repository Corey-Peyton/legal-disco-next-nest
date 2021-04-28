import { Document } from './document';

export interface DocumentAnnotationValue {
    document: Document;
    documentAnnotationId: number;
    documentId: number;
    id: number;
    pageId: number;
    value: string;
}
