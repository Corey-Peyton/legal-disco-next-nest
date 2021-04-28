import { Condition } from '@/enums/condition';
import { FieldType } from '@/enums/field-type';
import { Operation } from '@/enums/operation';
import { NodeType } from './node-type';

export interface Query {
    id: number;
    name: string;
    query: QueryGroup;
}

export interface QueryGroup {
    condition: Condition;
    id?: number | null;
    isGroup?: boolean;
    rules?: Array<QueryRule | QueryGroup>;
}

export interface QueryRule {
    fieldId?: number | string;
    fieldName?: string;
    fieldType?: NodeType;
    id?: number | null;
    operation: Operation;
    type?: FieldType;
    value?: any;
}
