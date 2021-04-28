import { QueryGroup } from './query-group';

export interface QueryRule {
    displayOrder: number;
    field: number;
    id: number;
    operation: number;
    parentQueryGroup: QueryGroup;
    parentQueryGroupId: number;
    type: number;
    value: string | null;
}
