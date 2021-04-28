import { Query } from './query';
import { QueryRule } from './query-rule';

export interface QueryGroup {
    childrenQueryGroup?: QueryGroup[];
    condition: number;
    displayOrder: number;
    id: number | null;
    isGroup: boolean;
    parentQueryGroup: QueryGroup | null;
    query: Query[] | null;
    queryRule?: QueryRule[];
    rules: Array<QueryGroup | QueryRule>;
}
