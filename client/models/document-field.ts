import { TreeData } from './tree-data';

// TODO: This TreeData extend should be from typewriter. Currently it is manual change.

export interface DocumentField extends TreeData {
    childDocumentField: DocumentField[];
    id: number;
    name: string;
    parent: DocumentField;
    parentId: number;
    type: number;
}
