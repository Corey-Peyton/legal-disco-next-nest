import { ProductionAnnotationFilter } from './production-annotation-filter';
import { Query } from './query';

export interface Production {
    childrenProduction: Production[];
    id: number;
    includeImage: boolean;
    includeNative: boolean;
    name: string;
    parentProduction: Production;
    parentProductionId: number;
    productionAnnotationFilter: ProductionAnnotationFilter[];
    query: Query;
    queryId: number;
}
