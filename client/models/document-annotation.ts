
export interface DocumentAnnotation {
    children: DocumentAnnotation[];
    id: number;
    name: string;
    parent: DocumentAnnotation;
    parentId: number;
}
