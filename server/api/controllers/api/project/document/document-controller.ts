﻿import { Client } from '@elastic/elasticsearch';
import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ObjectID } from 'bson';
import fs from 'fs';
import glob from 'glob';
import { GridFSBucket } from 'mongodb';
import path from 'path';
import { RabbitMQ } from '~/general/rabbitmq/rabbitmq';
import { FieldType } from '../../../../../ecdisco-models/enums/field-type';
import { NodeType } from '../../../../../ecdisco-models/enums/node-type';
import { KeyValue } from '../../../../../ecdisco-models/general/key-value';
import { Paginate } from '../../../../../ecdisco-models/general/paginate';
import { DocumentMetadatumModel } from '../../../../../ecdisco-models/master/document-metadatum';
import {
  Document,
  DocumentModel
} from '../../../../../ecdisco-models/projects/document';
import {
  DocumentField,
  DocumentFieldModel
} from '../../../../../ecdisco-models/projects/document-field';
import {
  DocumentFieldBooleanValue,
  DocumentFieldBooleanValueModel
} from '../../../../../ecdisco-models/projects/document-field-boolean-value';
import {
  DocumentFieldDateValue,
  DocumentFieldDateValueModel
} from '../../../../../ecdisco-models/projects/document-field-date-value';
import {
  DocumentFieldNumberValue,
  DocumentFieldNumberValueModel
} from '../../../../../ecdisco-models/projects/document-field-number-value';
import {
  DocumentFieldTextValue,
  DocumentFieldTextValueModel
} from '../../../../../ecdisco-models/projects/document-field-text-value';
import { DocumentMetadatumValueLinkModel } from '../../../../../ecdisco-models/projects/document-metadatum-value-link';
import { DocumentFields } from '../document-field/document-fields';
import { ProjectBaseController } from '../project-base-controller';
import { DocumentInfo } from './document-info';
import { $lookup } from './lookup';

@Controller('Document')
export class DocumentController extends ProjectBaseController {
  private get tempDocumentSearchResult(): string {
    return `Temp_Session_${this.sessionId}_DocumentSearchResult`;
  }

  @Post('deleteSelectedColumnData')
  async deleteSelectedColumnData(
    @Body() columnObject: any,
    @Headers('projectId') projectId: ObjectID,
  ): Promise<void> {
    this.projectContext;

    const fieldToRemove: any = {};
    fieldToRemove[columnObject.selectedColumn] = 1;

    (await this.projectContext(projectId)).db
      .collection(this.tempDocumentSearchResult)
      .updateMany({}, { $unset: fieldToRemove });
  }

  @Post('fieldData')
  fieldData(documentData: any): KeyValue[] {
    this.projectContext;

    return this.getDocumentFieldsData(null, documentData.documentId as number);
  }

  @Post('getDocumentFieldsData')
  getDocumentFieldsData(
    documentFields: DocumentField[],
    documentId: number,
  ): KeyValue[] {
    this.projectContext;

    if (documentFields === null) {
      documentFields = this.GetDocumentFields([null]);
    }

    let documentFieldsData: KeyValue[] = null;
    documentFields.forEach(async (documentField: DocumentField) => {
      let documentFieldData: KeyValue[] = null;

      switch (documentField.type as FieldType) {
        case FieldType.Checkbox:
          documentFieldData = (
            await DocumentFieldBooleanValueModel(documentField.id)
              .find({
                DocumentId: documentId,
              })
              .select(['id'])
              .exec()
          ).map((documentFieldDateValue) => {
            const keyValue: KeyValue = {};
            keyValue[documentFieldDateValue.id] = true.toString();
            return keyValue;
          });

          break;
        case FieldType.DateTime:
          // TODO: Except boolean following all query are same except for type. Can be common.
          // TODO: 2 Here actual table is dynamic as `DocumentField_${documentField.id}`. Fix for all switch case. not writing comment for all.
          documentFieldData = (
            await DocumentFieldDateValueModel(documentField.id)
              .find({ DocumentId: documentId })
              .select(['id', 'value'])
              .exec()
          ).map((documentFieldDateValue) => {
            const keyValue: KeyValue = {};
            keyValue[
              documentFieldDateValue.id
            ] = documentFieldDateValue.value.toString();
            return keyValue;
          });

          break;
        case FieldType.Number:
          documentFieldData = (
            await DocumentFieldNumberValueModel(documentField.id)
              .find({ DocumentId: documentId })
              .select(['id', 'value'])
              .exec()
          ).map((documentFieldDateValue) => {
            const keyValue: KeyValue = {};
            keyValue[
              documentFieldDateValue.id
            ] = documentFieldDateValue.value.toString();
            return keyValue;
          });
          break;
        case FieldType.Radio:
          // TODO: Pending
          break;
        case FieldType.Text:
          documentFieldData = (
            await DocumentFieldTextValueModel(documentField.id)
              .find({ DocumentId: documentId })
              .select(['id', 'value'])
              .exec()
          ).map((documentFieldDateValue) => {
            const keyValue: KeyValue = {};
            keyValue[documentFieldDateValue.id] = documentFieldDateValue.value;
            return keyValue;
          });
          break;
        default:
      }

      const childDocumentFieldData: KeyValue[] = this.getDocumentFieldsData(
        documentField.children as DocumentField[],
        documentId,
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

  @Post('PNG')
  PNG(
    @Body() documentData: any,
    @Headers('projectId') projectId: ObjectID,
  ): DocumentInfo {
    this.projectContext;

    // TODO: Following path should be from database.
    const directoryPath: string = path.join(
      'C:\\ecdiscoProjects',
      `Project_${projectId}`,
      'Processed',
    );

    const strDocumentId: string = documentData.documentId.toString();
    const splitFileName: string[] = strDocumentId
      .split('(?<=\\G.{2})')
      .filter((s) => s !== '');

    if (
      splitFileName[splitFileName.length - 1].length < 2 ||
      splitFileName[splitFileName.length - 1] ===
        strDocumentId.substring(strDocumentId.length - 2)
    ) {
      splitFileName.pop();
    }

    const fileDirectoryPath: string = path.join(
      directoryPath,
      ['\\', splitFileName].join(),
    );

    const dirCont = fs.readdirSync(fileDirectoryPath);
    const files = dirCont.filter((elm) =>
      elm.match(new RegExp(`${strDocumentId}_P*_png*.png`, 'ig')),
    );

    // TODO: Currently it returns only first page. Multi page need to handle
    // TODO: Currently count is from files. this can be from DB to improve performance as currently it brings all the files pages.
    return {
      fileContentResult: fs.readFileSync(files[0]),
      count: files.length,
    };
  }

  @Post('saveDocumentImages')
  async saveDocumentImages(
    @Body('projectId') projectId: ObjectID,
    @Body('documentId') documentId: ObjectID,
  ) {
    const bucket = new GridFSBucket((await this.projectContext(projectId)).db, {
      bucketName: 'DocumentImageFile',
    });

    glob(
      `C:/ecdiscoMaster/Temp/${documentId}_P+([0-9])_png.png`,
      null,
      (er, files) => {
        files.forEach((file) => {
          fs.createReadStream(file)
            .pipe(bucket.openUploadStream(documentId.toString()))
            .on('finish', () => {});
        });
      },
    );
  }

  @Post('saveDocument')
  async saveDocument(
    @Body('document') document: Document,
    @Body('metadata') metadata: string,
    @Body('outputPath') outputPath: string,
    @Headers('projectid') projectId: ObjectID,
  ): Promise<void> {
    await DocumentModel(await this.projectContext(projectId)).create({
      id: document.id,
      parentDocumentId: document.parentDocumentId,
      datasourceId: document.datasourceId,
      fileName: path.parse(document.fileName).name,
      fileExtension: path.parse(document.fileName).ext,
    });

    const metadatas: any = JSON.parse(metadata);
    // ConnectionPool masterContext = new ConnectionPool();
    const documentMetadataValue: { [key: string]: string[] } = {};

    Object.keys(metadatas).forEach(async (key) => {
      documentMetadataValue[key] = metadatas[key];

      // TODO: We need to manage if already exists then get value of it.
      let documentMetadata = await DocumentMetadatumModel(
        await this.masterContext,
      ).findOne({ name: key });

      if (!documentMetadata) {
        documentMetadata = await DocumentMetadatumModel(
          await this.masterContext,
        ).create({
          name: key,
        });
      }

      Object.keys(documentMetadataValue).forEach((documentMetadataKey) => {
        documentMetadataValue[documentMetadataKey].forEach(
          async (metadataValue: string) => {
            // TODO: Need to use above dynamic table name: documentMetadataTable
            let existingMetadataValueRecord = await DocumentMetadatumValueLinkModel(
              await this.projectContext(projectId),
              documentMetadata.id,
            )
              .findOne({
                metadataId: documentMetadata.id,
                documentMetadataValue: metadataValue,
              })
              .select('id');

            if (!existingMetadataValueRecord) {
              existingMetadataValueRecord = await DocumentMetadatumValueLinkModel(
                await this.projectContext(projectId),
                documentMetadata.id,
              ).create({
                documentMetadataValueId: documentMetadata.id,
                documentMetadataValue: metadataValue,
              });
            }

            DocumentMetadatumValueLinkModel(
              await this.projectContext(projectId),
              documentMetadata.id,
            ).create({
              documentMetadataValueId: existingMetadataValueRecord.id,
              documentId: document.id,
            });
          },
        );
      });
    });

    // Connect to the db
    const bucket = new GridFSBucket((await this.projectContext(projectId)).db, {
      bucketName: 'DocumentTextFile',
    });

    fs.createReadStream(outputPath)
      .pipe(bucket.openUploadStream(document.id.toString()))
      .on('finish', () => {});

    fs.createReadStream(`${outputPath}.txt`)
      .pipe(bucket.openUploadStream(document.id.toString()))
      .on('finish', () => {
        // Delete temp text file.
        fs.unlink(`${outputPath}.txt`, () => {});
      });

    // Image Export
    RabbitMQ.sendToQueue('DocumentExport', {
      projectId,
      documentId: document.id,
      InputFileName: outputPath,
      OutputType: 'PNG',
    });
  }

  @Post('saveFieldData')
  saveFieldData(
    @Body() fieldData: any,
    @Headers('projectId') projectId: ObjectID,
  ): void {
    this.projectContext;

    const documentId: ObjectID = fieldData.documentId as ObjectID;
    const fieldType: FieldType = (fieldData.fieldType as number) as FieldType;
    const fieldId: ObjectID = fieldData.fieldId as ObjectID;
    const fieldValue: string = fieldData.fieldValue as string;
    switch (fieldType) {
      case FieldType.Checkbox:
      case FieldType.Radio:
        // TODO: Each switch case is repititive. Need common interface.
        // TODO: 2 Need to use for all switch cases. use dynamic table name.
        if (fieldValue) {
          if (
            !DocumentFieldBooleanValueModel(fieldId).findOne({
              documentId: documentId,
            } as DocumentFieldBooleanValue)
          ) {
            DocumentFieldBooleanValueModel(fieldId).create({
              documentId: documentId,
            } as DocumentFieldBooleanValue);
          }
        } else {
          DocumentFieldBooleanValueModel(fieldId).deleteOne({
            documentId: documentId,
          } as DocumentFieldBooleanValue);
        }
        break;
      case FieldType.DateTime:
        if (fieldValue) {
          if (
            !DocumentFieldDateValueModel(fieldId).findOne({
              value: new Date(fieldValue),
              id: documentId,
            } as DocumentFieldDateValue)
          ) {
            DocumentFieldDateValueModel(fieldId).create({
              value: new Date(fieldValue),
              id: documentId,
            } as DocumentFieldDateValue);
          }
        } else {
          DocumentFieldDateValueModel(fieldId).deleteOne({
            DocumentId: documentId,
          });
        }
        break;
      case FieldType.Number:
        if (fieldValue) {
          if (
            !DocumentFieldNumberValueModel(fieldId).findOne(({
              value: Number(fieldValue),
              documentId,
            } as unknown) as DocumentFieldNumberValue)
          ) {
            DocumentFieldNumberValueModel(fieldId).create(({
              value: Number(fieldValue),
              documentId,
            } as unknown) as DocumentFieldNumberValue);
          }
        } else {
          DocumentFieldNumberValueModel(fieldId).deleteOne({
            DocumentId: documentId,
          });
        }
        break;
      case FieldType.Text:
        if (fieldValue) {
          if (
            !DocumentFieldTextValueModel(fieldId).findOne(({
              value: fieldValue,
              documentId,
            } as unknown) as DocumentFieldTextValue)
          ) {
            DocumentFieldTextValueModel(fieldId).create(({
              value: fieldValue,
              documentId,
            } as unknown) as DocumentFieldTextValue);
          }

          const client = new Client();

          client.index({
            id: fieldId.toString(),
            index: 'project_documents_textfielddata',
            body: {
              FieldId: fieldId,
              DocumentId: documentId,
              Value: fieldData.fieldHTMLText,
            },
            routing: projectId.toString(),
          });
        } else {
          DocumentFieldTextValueModel(fieldId).deleteOne({
            DocumentId: documentId,
          });

          const client = new Client();

          client.delete({
            id: fieldId.toString(),
            index: 'project_documents_textfielddata',
            routing: projectId.toString(),
          });
        }

        break;
      default:
    }
  }

  @Post('setAndGetSelectedColumnData')
  async setAndGetSelectedColumnData(
    @Body() paramsObject: any,
    @Headers('projectId') projectId: ObjectID,
  ): Promise<any[]> {
    this.projectContext;

    const columnName: string = paramsObject.selectedColumn as string;

    const selectedColumn = columnName.split('_');

    const columnNameWIthJoin: {
      [key: string]: $lookup;
    } = new DocumentFields().GetColumnNameAndJoin(
      Number(selectedColumn[0]) as NodeType,
      Number(selectedColumn[1]),
      await this.projectContext(projectId),
    );

    (await this.projectContext(projectId)).db
      .collection(this.tempDocumentSearchResult)
      .find()
      .forEach((tempTableRow) => {
        //Reference https://stackoverflow.com/a/19823548/9263418
        const column = Object.keys(columnNameWIthJoin)[0];
        let docTableRow;

        (async () => {
          docTableRow = await DocumentModel(
            await this.projectContext(projectId),
          ).aggregate([
            {
              $lookup: columnNameWIthJoin[column],
            },
            { $match: { id: tempTableRow.id } },
          ]); // TODO: Here we need to have aggregate with

          if (docTableRow != null) {
            tempTableRow[columnName] = (docTableRow as any)[column];
          }
        })();
      });

    // Return Paginated Data from temp table.
    const paginate: Paginate = paramsObject.paginate;
    let paginatedData: Promise<any[]>;

    paginatedData = (await this.projectContext(projectId)).db
      .collection(this.tempDocumentSearchResult)
      .find({ id: { $g: paginate.lastRowValue } })
      .limit(paginate.pageSize)
      .sort(paginate.sorting)
      .toArray();

    return (await paginatedData).map((r) => r[0]);
  }

  private GetDocumentFields(parentIds: ObjectID[]): DocumentField[] {
    let documentFields: DocumentField[];

    (async () => {
      documentFields = await DocumentFieldModel.find({
        ParentId: { $in: parentIds },
      }).select(['id', 'name', 'type']);
    })();

    documentFields.map((documentField) => {
      (async () => {
        documentField.children = await this.GetDocumentFields([
          documentField.id,
        ]);
      })();

      return documentField;
    });

    return documentFields;
  }
}
