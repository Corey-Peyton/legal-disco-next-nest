import { Mongoose } from 'mongoose';
import { FieldType } from '../../../../../ecdisco-models/enums/field-type';
import { NodeType } from '../../../../../ecdisco-models/enums/node-type';
import { DocumentFieldModel } from '../../../../../ecdisco-models/projects/document-field';
import { $lookup } from '../document/lookup';

export class DocumentFields {
  GetColumnNameAndJoin(
    columnType: NodeType,
    columnId: number,
    projectContext: Mongoose
  ): { [key: string]: $lookup } {
    let columnName = '';
    let joinQuery: $lookup;
    switch (columnType) {
      case NodeType.Project:
        break;
      case NodeType.Datasource:
        break;
      case NodeType.DocumentMetadata:
        break;
      case NodeType.DocumentField:
        const selectedColumnId: string = columnId.toString();
        const documentFieldValue = `DocumentField_${selectedColumnId}`;
        const documentFieldColumnName = `{${NodeType.DocumentField}_${selectedColumnId}`;
        let fieldType: FieldType;
         (async () => {
          fieldType = (await DocumentFieldModel.findById(selectedColumnId)).type;
        })();

        joinQuery = {
          from: documentFieldValue,
          localField: 'id',
          foreignField: 'DocumentId',
          as: documentFieldValue,
        };

        switch (fieldType) {
          case FieldType.Number:
            columnName = `${documentFieldValue}.Value`;
            break;
          case FieldType.DateTime:
            columnName = `${documentFieldValue}.Value; `;
            break;
          case FieldType.Checkbox:
          case FieldType.Radio:
            columnName = `CASE
                            WHEN ${documentFieldValue}.DocumentId IS NULL THEN 'False';
                            ELSE 'True';
                            END; `;
            break;
          case FieldType.Text:
            columnName = `${documentFieldValue}.Value`;
            break;
          default:
        }

        columnName += `; AS '${documentFieldColumnName} '; `;

        joinQuery = {
          from: documentFieldValue,
          localField: 'id',
          foreignField: 'DocumentId',
          as: documentFieldValue,
        };

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

    const returnObject: { [key:string]: $lookup } = {};
    returnObject[columnName] = joinQuery;
    return returnObject;
  }
} 