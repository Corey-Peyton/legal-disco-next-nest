import { Document } from './document';

export interface Datasource {
    document: Document[];
    id: number;
    name: string;
    source: number;
    type: number;
}
