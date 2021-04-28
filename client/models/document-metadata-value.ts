import { Document } from './document';

export interface DocumentMetadataValue {
    document: Document;
    documentId: number;
    id: number;
    value: string;
}
