import { Mongoose } from 'mongoose';
import {
  QueryRule,
  QueryRuleModel,
} from '../../../../../ecdisco-models/general/query-rule';
import { Condition } from '../../../../../ecdisco-models/enums/condition';
import { QueryModel } from '../../../../../ecdisco-models/projects/query';
import { $lookup } from '../document/lookup';

export class Search {
  Load(
    queryId: number,
    insertIfNull: boolean,
    projectContext: Mongoose
  ): QueryRule {
    let QueryRule: QueryRule;

    const lookup: $lookup = {
      from: 'QueryRule',
      foreignField: 'QueryId',
      localField: 'id',
      as: 'QueryRule',
    };

    QueryRule = QueryModel.aggregate([
      { $lookup: lookup },
      { $match: { id: queryId } },
    ]).exec();

    if (insertIfNull && QueryRule === null) {
      // Default we are showing one QueryRule at client side.
      QueryRule = { condition: Condition.And } as QueryRule;
      let QueryRuleId;

      (async () => {
        QueryRuleId = (
          await QueryRuleModel.create({ condition: Condition.And } as QueryRule)
        ).id;
      })();

      QueryModel.findByIdAndUpdate(queryId, {
        $set: { QueryRuleId: QueryRuleId },
      });
    }

    this.GetDecendantsFromList(QueryRule, QueryRule.rules as QueryRule[]);

    return QueryRule;
  }

  private GetDecendantsFromList(parent: QueryRule, items: QueryRule[]): void {
    parent.rules = items.filter((a) => a.parentQueryRuleId === parent.id);
    parent.rules.forEach((child) => {
      this.GetDecendantsFromList(child as QueryRule, items);
    });
  }
}
