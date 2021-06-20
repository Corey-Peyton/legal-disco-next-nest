import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ObjectID } from 'mongodb';
import {
  ChildRule,
  ChildRuleModel,
  QueryRule,
  QueryRuleModel
} from '../../../../../ecdisco-models/general/query-rule';
import { Query, QueryModel } from '../../../../../ecdisco-models/projects/query';
import { ProjectBaseController } from '../project-base-controller';
import { Search } from './search';

@Controller('Search')
export class SearchController extends ProjectBaseController {

  @Post('getSearches')
  async getSearches(): Promise<Query[]> {

    this.projectContext;

    return await QueryModel.find({});
  }

  @Post('load')
  async load(@Body() search: any, @Headers('projectId') projectId: ObjectID): Promise<QueryRule> {

    this.projectContext;

    const queryId: number = search.queryId as number;

    return new Search().Load(queryId, true, await this.projectContext(projectId));
  }

  @Post('save')
  async save(@Body() search: any) {

    this.projectContext;

    const query: Query = search as Query;
    // TODO: recursively call for nested query. and also added modified need to handle.
    // EntityState entityState = query.id === 0 ? EntityState.Added : EntityState.Modified;
    // EntityEntry<Query> entityEntry = projectContext.Entry(query);

    // EntityEntry.State = entityState;

    const QueryRuleId = (
      await QueryRuleModel.create({
        condition: query.queryRule.condition,
      } as QueryRule)
    ).id;

    query.queryRule.rules.forEach((queryRule: ChildRule) => {
      ChildRuleModel.create({
        operation: queryRule.operation,
        fieldId: queryRule.fieldId,
        parentQueryRuleId: QueryRuleId,
        value: queryRule.value,
        fieldType: queryRule.fieldType,
      } as ChildRule);
    });

    QueryModel.updateOne(
      { id: query.id },
      { $set: { queryRuleId: QueryRuleId } }
    );
  }
}
