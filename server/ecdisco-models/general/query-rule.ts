import { getModelForClass, prop, Ref } from '@typegoose/typegoose';
import { ObjectID } from 'bson';
import { Condition } from '../enums/condition';
import { FieldType } from '../enums/field-type';
import { NodeType } from '../enums/node-type';
import { Operation } from '../enums/operation';
import { ModelBase } from './model-base';

export class QueryRule extends ModelBase {

  @prop()
  condition: Condition;
  @prop()
  rules: Ref<QueryRule | ChildRule>[];
  @prop()
  queryId: number;
  @prop()
  parentQueryRuleId: ObjectID;
}

export class ChildRule extends ModelBase {
  @prop()
  fieldId: number;
  @prop()
  fieldType: NodeType;
  @prop()
  type: FieldType;
  @prop()
  operation: Operation;
  @prop()
  value: string;
  @prop()
  parentQueryRuleId: number;
}

const QueryRuleModel = getModelForClass(QueryRule);
const ChildRuleModel = getModelForClass(ChildRule);
export { QueryRuleModel, ChildRuleModel };
