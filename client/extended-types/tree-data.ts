import { FieldType } from '@/enums/field-type';
import { NodeType } from '@/models/node-type';
import { TreeData as BaseTreeData } from 'element-ui/types/tree';

export interface TreeData extends BaseTreeData {
    checkable?: boolean;
    children?: TreeData[];
    fieldType?: FieldType;
    isAdd?: boolean;
    isEdit?: boolean;
    nodeType?: NodeType;
    predefinedType?: boolean;
    tagInputVisible?: boolean;
    value?: any;
}
