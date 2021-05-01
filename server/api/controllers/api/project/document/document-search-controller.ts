import { Client } from '@elastic/elasticsearch';
import { Condition } from '../../../../../ecdisco-models/enums/condition';
import { FieldType } from '../../../../../ecdisco-models/enums/field-type';
import { NodeType } from '../../../../../ecdisco-models/enums/node-type';
import { Operation } from '../../../../../ecdisco-models/enums/operation';
import { Paginate } from '../../../../../ecdisco-models/general/paginate';
import {
  ChildRule,
  QueryRule,
} from '../../../../../ecdisco-models/general/query-rule';
import {
  UserColumn,
  UserColumnModel,
} from '../../../../../ecdisco-models/projects/user-column';
import { ProjectBaseController } from '../project-base-controller';
import { GridData } from './grid-data';
import { DocumentType } from '@typegoose/typegoose/lib/types';
import { DocumentModel } from '../../../../../ecdisco-models/projects/document';
import { $lookup } from './lookup';
import { DocumentFieldModel } from '../../../../../ecdisco-models/projects/document-field';
import { Controller } from '@nestjs/common';

@Controller()
export class DocumentSearchController extends ProjectBaseController {
  get tempDocumentSearchResult(): string {
    return `Temp_Session_${this.sessionId}_DocumentSearchResult`;
  }

  GetSearchResultPagedData(filterData: any): GridData {
    const paginate: Paginate = filterData.paginate as Paginate;

    return this.GetPagedData(paginate);
  }

  async Search(filterData: any): Promise<GridData> {
    const paginate: Paginate = filterData.paginate as Paginate;

    const whereQuery: any = {};

    this.projectContext.connection
      .collection(this.tempDocumentSearchResult)
      .drop();

    const lookups: $lookup[] = [];
    const selectedColumn: { [key: string]: number } = {};
    this.SelectColumns(lookups).forEach((sc) => {
      selectedColumn[sc] = 1;
    });

    this.SearchQuery(
      filterData.queryRule as QueryRule,
      lookups,
      whereQuery,
      filterData.queryRule.Condition
    );

    const finalQuery = [whereQuery, ...lookups];

    await this.projectContext.connection
      .collection(this.tempDocumentSearchResult)
      .insertMany(await DocumentModel.aggregate(finalQuery));

    const gridData = this.projectContext.connection
      .collection(this.tempDocumentSearchResult)
      .find({}, selectedColumn);

    paginate.total = await gridData.count();

    return this.GetPagedData(paginate);
  }

  private GetPagedData(paginate: Paginate): GridData {
    let paginatedData;

    (async () => {
      paginatedData = await this.projectContext.connection.db
        .collection(this.tempDocumentSearchResult)
        .find({ id: { $g: paginate.lastRowValue } })
        .limit(paginate.pageSize)
        .sort(paginate.sorting)
        .toArray();
    })();

    return {
      documents: paginatedData,
      paginate,
    };
  }

  SelectColumns(joinQuery: $lookup[]): string[] {
    let query: DocumentType<UserColumn>[];

    (async () => {
      query = await UserColumnModel.find();
    })();

    const columns: string[] = ['Document.id'];

    query.forEach((userColumn) => {
      let columnName = '';

      // TODO: use method of documentfields.cs
      switch (userColumn.columnType) {
        case NodeType.Project:
          break;
        case NodeType.Datasource:
          break;
        case NodeType.DocumentMetadata:
          break;
        case NodeType.DocumentField:
          const selectedColumnId: string = userColumn.columnId.toString();
          const documentFieldValue = `DocumentField_${selectedColumnId}`;

          let fieldType: FieldType;

          (async () => {
            fieldType = await (await DocumentFieldModel.findById(selectedColumnId)).type;
          })();

          switch (fieldType) {
            case FieldType.Number:
              columnName = `${documentFieldValue}.Value`;
              break;
            case FieldType.DateTime:
              columnName = `${documentFieldValue}.Value`;
              break;
            case FieldType.Checkbox:
            case FieldType.Radio:
              columnName = `CASE WHEN ${documentFieldValue}.DocumentId IS NULL 
                                         THEN 'False'
                                         ELSE 'True'
                                         END `;
              break;
            case FieldType.Text:
              columnName = `${documentFieldValue}.Value`;
              break;
            default:
          }

          joinQuery.push({
            from: documentFieldValue,
            localField: 'id',
            foreignField: 'DocumentId',
            as: documentFieldValue,
          });

          break;
        case NodeType.Annotation:
          break;
        case NodeType.SinglePageAnnotation:
          break;
        case NodeType.MultiPageAnnotation:
          break;
        case NodeType.Search:
          break;
        case NodeType.Production:
          break;
        default:
      }

      columns.push(columnName);
    });
    return columns;
  }

  public SearchQuery(
    queryRule: QueryRule,
    joinQuery: $lookup[],
    whereQuery: { [key: string]: any },
    condition: Condition
  ): void {

    let i = 0;

    queryRule.rules.forEach((childRule: ChildRule) => {
      switch (queryRule.condition) {
        case Condition.And:
          if (i === 0) {
            whereQuery.$and = [];
          }
          break;
        case Condition.Or:
          if (i === 0) {
            whereQuery.$or = [];
          }
          break;
        case Condition.Not:
          if (i === 0) {
            whereQuery.$not = {};
          }
          break;
        default:
      }

      if ((childRule as unknown as QueryRule).condition) {

        this.SearchQuery(
          childRule as unknown as QueryRule,
          joinQuery,
          whereQuery,
          queryRule.condition
        );

      } else {
        // When field will be null, it means filter is not selected. we'll ignore it.
        switch (childRule.operation as Operation) {
          case Operation.EqualTo:
            if (childRule.value === null) {
              break;
            }
            break;
          case Operation.NotEqualTo:
            break;
          case Operation.GreaterThan:
            break;
          case Operation.GreaterThanEqualTo:
            break;
          case Operation.LessThan:
            break;
          case Operation.LessThanEqualTo:
            break;
          case Operation.Between:
            break;
          case Operation.includes:
            break;
          case Operation.DoesNotContain:
            break;
          case Operation.startsWith:
            break;
          case Operation.EndsWith:
            break;
          case Operation.In:
            break;
          case Operation.NotIn:
            break;
          case Operation.IsEmpty:
            break;
          case Operation.IsNotEmpty:
            break;
          default:
        }

        this.applyRule(
          childRule as ChildRule,
          joinQuery,
          whereQuery,
          condition
        );
      }
      i++;
    });

  }

  // TODO: We don't need this function seperately. as it is calling from single place. so will merge later.
  private async applyRule(
    childRule: ChildRule,
    joinQuery: $lookup[],
    whereQuery: { [key: string]: any },
    condition: Condition
  ): Promise<void> {
    const documentFieldValue = `DocumentField_${childRule.fieldId}`;
    const documentField: { [key: string]: any } = {};

    switch (childRule.type) {
      case FieldType.Checkbox:
      case FieldType.Radio:
        documentField[`${documentFieldValue}.documentId`] = '';

        switch (condition) {
          case Condition.And:
            whereQuery.$and.push(documentField);
            break;
          case Condition.Or:
            whereQuery.$and.push(documentField);
            break;
          case Condition.Not:
            // TODO:
            break;
        }

        break;
      case FieldType.DateTime:
      case FieldType.Number:
        documentField[`${documentFieldValue}.value`] = childRule.value;

        switch (condition) {
          case Condition.And:
            whereQuery.$and.push(documentField);
            break;
          case Condition.Or:
            whereQuery.$and.push(documentField);
            break;
          case Condition.Not:
            // TODO:
            break;
        }

        break;
      case FieldType.Text:
        documentField[`${documentFieldValue}.DocumentId`] = '';

        switch (condition) {
          case Condition.And:
            whereQuery.$and.push(documentField);
            break;
          case Condition.Or:
            whereQuery.$and.push(documentField);
            break;
          case Condition.Not:
            // TODO:
            break;
        }

        const client = new Client();

        // TODO: We need to keep making search query. and only during final fetch it should fetch data.
        const elasticSearchResponse = await client.search({
          index: 'project_documents_textfielddata',
          body: {
            query: {
              match: {
                fieldId: childRule.value,
              },
            },
          },
          routing: this.projectId.toString(),
        });

        // TODO: We need to keep making search query. and only during final fetch it should fetch data.

        const fieldTextValueDocumentIds: {
          [key: string]: string;
        }[] = elasticSearchResponse.body.map((dftv: any) => {
          return {
            DocumentId: dftv.DocumentId,
          };
        });

        const tempTableName = '#MatchedTextDocuments';

        this.projectContext.connection.db
          .collection(tempTableName)
          .insertMany(fieldTextValueDocumentIds);

        joinQuery.push({
          from: tempTableName,
          localField: 'id',
          foreignField: 'DocumentId',
          as: tempTableName,
        });

        break;
      default:
        break;
    }

    if (childRule.type !== FieldType.Text) {
      // Text field is joined with elastic search temp table result in above switch case, so not required here.
      joinQuery.push({
        from: documentFieldValue,
        localField: 'id',
        foreignField: 'documentId',
        as: documentFieldValue,
      });
    }
  }
}
