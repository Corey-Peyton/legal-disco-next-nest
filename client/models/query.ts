import { Production } from './production';
import { ProductionAnnotationFilter } from './production-annotation-filter';
import { QueryGroup } from './query-group';

export interface Query {
    childrenQuery: Query[];
    id: number;
    name: string;
    parentQuery: Query;
    parentQueryId: number;
    production: Production[];
    productionAnnotationFilter: ProductionAnnotationFilter[];
    queryGroup: QueryGroup;
    queryGroupId: number;
}
