import { FieldType } from '@/enums/field-type';

export interface ObjectProperty {
    label: string;
    prop: number;
    type: FieldType;
    value: string;
}
