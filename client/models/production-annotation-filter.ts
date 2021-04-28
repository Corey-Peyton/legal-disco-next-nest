import { DocumentAnnotation } from './document-annotation';
import { Production } from './production';
import { Query } from './query';

export interface ProductionAnnotationFilter {
    annotation: DocumentAnnotation;
    annotationId: number;
    id: number;
    production: Production;
    productionId: number;
    query: Query;
    queryId?: number;
}
