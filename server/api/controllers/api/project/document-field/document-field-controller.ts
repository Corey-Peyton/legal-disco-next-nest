import { Body, Controller, Post } from '@nestjs/common';
import { Ref } from '@typegoose/typegoose';
import { ObjectID } from 'bson';
import { ObjectId } from 'mongodb';
import { FieldType } from '../../../../../ecdisco-models/enums/field-type';
import { KeyValue } from '../../../../../ecdisco-models/general/key-value';
import {
  DocumentField,
  DocumentFieldModel
} from '../../../../../ecdisco-models/projects/document-field';
import {
  DocumentFieldBooleanValueModel
} from '../../../../../ecdisco-models/projects/document-field-boolean-value';
import {
  DocumentFieldDateValueModel
} from '../../../../../ecdisco-models/projects/document-field-date-value';
import {
  DocumentFieldNumberValueModel
} from '../../../../../ecdisco-models/projects/document-field-number-value';
import {
  DocumentFieldTextValueModel
} from '../../../../../ecdisco-models/projects/document-field-text-value';
import { ProjectBaseController } from '../project-base-controller';

@Controller('DocumentField')
export class DocumentFieldController extends ProjectBaseController {

  @Post('saveDocumentField')
  async saveDocumentField(@Body() documentFields: any): Promise<number> {

    this.projectContext;

    const documentField: DocumentField = documentFields.documentField as DocumentField;
    let documentFieldId;

    if (documentField.id) {
      DocumentFieldModel.findByIdAndUpdate(documentField.id, {
        $set: { Name: documentField.name },
      });
    } else {
      documentFieldId = (
        await DocumentFieldModel.create({
          name: documentField.name,
          parentId: documentField.parentId,
          type: documentField.type,
        } as DocumentField)
      ).id;
    }

    return documentFieldId;
  }

  private GetDocumentFields(parentIds: ObjectID[]): DocumentField[] {

    this.projectContext;

    let documentFields: DocumentField[];

    (async () => {
      documentFields = await DocumentFieldModel.find({
        ParentId: { $in: parentIds },
      }).select(['id', 'Name', 'Type', 'expandedNode']);
    })();

    documentFields.map((documentField) => {
      documentField.children = this.GetDocumentFields([documentField.id]);
      return documentField;
    });

    return;
  }

  private GetDocumentFieldsData(
    documentFields: DocumentField[],
    documentId: ObjectID
  ): KeyValue[] {

    this.projectContext;

    if (documentFields === null) {
      documentFields = this.GetDocumentFields([null]);
    }

    let documentFieldsData: KeyValue[] = null;
    documentFields.forEach((documentField) => {
      let documentFieldData: KeyValue[] = null;

      switch (documentField.type as FieldType) {
        case FieldType.Checkbox:
          (async () => {
            documentFieldData = (
              await DocumentFieldBooleanValueModel(documentField.id)
                .find({ DocumentId: documentId })
                .select('id')
            ).map((documentFieldBooleanValue) => {
              const keyValue: KeyValue = {};
              keyValue[documentFieldBooleanValue.id] = true.toString();
              return keyValue;
            });
          })();
          break;
        case FieldType.DateTime:
          // TODO: Except boolean following all query are same except for type. Can be common.
          (async () => {
            documentFieldData = (
              await DocumentFieldDateValueModel(documentField.id)
                .find({ DocumentId: documentId })
                .select(['id', 'value'])
            ).map((documentFieldDateValue) => {
              const keyValue: KeyValue = {};
              keyValue[
                documentFieldDateValue.id
              ] = documentFieldDateValue.value.toString();
              return keyValue;
            });
          })();
          break;
        case FieldType.Number:
          (async () => {
            documentFieldData = (
              await DocumentFieldNumberValueModel(documentField.id)
                .find({ DocumentId: documentId })
                .select(['id', 'value'])
            ).map((documentFieldNumberValue) => {
              const keyValue: KeyValue = {};
              keyValue[
                documentFieldNumberValue.id
              ] = documentFieldNumberValue.value.toString();
              return keyValue;
            });
          })();
          break;
        case FieldType.Radio:
          //TODO: Pending
          break;
        case FieldType.Text:
          (async () => {
            documentFieldData = (
              await DocumentFieldTextValueModel(documentField.id)
                .find({ DocumentId: documentId })
                .select(['id', 'value'])
            ).map((documentFieldTextValue) => {
              const keyValue: KeyValue = {};
              keyValue[
                documentFieldTextValue.id
              ] = documentFieldTextValue.value.toString();
              return keyValue;
            });
          })();
          break;
        default:
          break;
      }

      const childDocumentFieldData: KeyValue[] = this.GetDocumentFieldsData(
        documentField.children as DocumentField[],
        documentId
      );
      if (documentFieldData === null) {
        documentFieldData = childDocumentFieldData;
      } else if (childDocumentFieldData !== null) {
        documentFieldData = documentFieldData.concat(childDocumentFieldData);
      }

      if (documentFieldsData === null) {
        documentFieldsData = documentFieldData;
      } else if (documentFieldData !== null) {
        documentFieldsData = documentFieldsData.concat(documentFieldData);
      }
    });

    return documentFieldsData;
  }
}
