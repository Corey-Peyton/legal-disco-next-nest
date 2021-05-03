import { Body, Controller, Post } from '@nestjs/common';
import AdmZip from 'adm-zip';
import * as amqp from 'amqplib/callback_api';
import * as fs from 'fs';
import path from 'path';
import { FileResponse } from '../../../../../ecdisco-models/general/file-response';
import {
  QueryRule,
  QueryRuleModel,
} from '../../../../../ecdisco-models/general/query-rule';
import { DocumentModel } from '../../../../../ecdisco-models/projects/document';
import { DocumentAnnotationModel } from '../../../../../ecdisco-models/projects/document-annotation';
import { DocumentAnnotationValueModel } from '../../../../../ecdisco-models/projects/document-annotation-value';
import { DocumentAnnotationValueMultiPageModel } from '../../../../../ecdisco-models/projects/document-annotation-value-multi-page';
import {
  Production,
  ProductionModel,
} from '../../../../../ecdisco-models/projects/production';
import { ProductionAnnotationFilterModel } from '../../../../../ecdisco-models/projects/production-annotation-filter';
import { DocumentSearchController } from '../document/document-search-controller';
import { $lookup } from '../document/lookup';
import { ProjectBaseController } from '../project-base-controller';

@Controller('Production')
export class ProductionController extends ProjectBaseController {

  @Post('production')
  async production(@Body() production: Production): Promise<Production> {
    return await ProductionModel.findById(production.id);
  }

  @Post('productions')
  async productions(): Promise<Production[]> {
    return await ProductionModel.find({});
  }

  @Post('saveProduction')
  async saveProduction(@Body() production: Production): Promise<number> {
    return (
      await ProductionModel.create({
        includeImage: production.includeImage,
        includeNative: production.includeNative,
        name: production.name,
        parentProductionId: production.parentProductionId,
        queryId: production.queryId,
      } as Production)
    ).id;
  }

  @Post('runProduction')
  async runProduction(@Body() production: Production): Promise<void> {
    // 1  Get Prduction id
    const productionId = production.id;

    // 2 Get main query to filter main documents
    const queryId: number = (await ProductionModel.findById(productionId))
      .queryId;

    const productionDocuments = this.getDocumentIdsByQueryId(queryId);

    // Array<DocumentId, AnnotationId>
    const documentsAnnotations: { [key: number]: number[] } = [];

    // 3 Get filters to annotate data
    const annotationQueryData = await ProductionAnnotationFilterModel.find({
      ProductionId: productionId,
    }).select(['queryId', 'annotationId']);

    annotationQueryData.forEach((annotationQueryRow) => {
      const annotationDocuments = this.getDocumentIdsByQueryId(
        annotationQueryRow.queryId as number
      );

      annotationDocuments.forEach((annotationDocumentId) => {
        if (!(annotationDocumentId in documentsAnnotations)) {
          documentsAnnotations[annotationDocumentId] = [];
        }

        documentsAnnotations[annotationDocumentId].push(
          annotationQueryRow.annotationId
        );
      });
    });

    // 4 Now loop through main documents
    productionDocuments.forEach((productionDocumentId) => {
      // 5  If document is associated in any annotation, then do annotation.
      if (productionDocumentId in documentsAnnotations) {
        const documentAnnotations: number[] =
          documentsAnnotations[productionDocumentId];

        const annotationsArray: any[] = [];

        documentAnnotations.forEach(async (annotationId: number) => {
          const isMultiPageAnnotation = (
            await DocumentAnnotationModel.findById(annotationId).select(
              'isMultiPage'
            )
          ).isMultiPage;

          if (isMultiPageAnnotation) {
            const multiPageAnnotationValue = await DocumentAnnotationValueMultiPageModel.findOne(
              { DocumentAnnotationId: annotationId }
            ).select('value');

            annotationsArray.push(multiPageAnnotationValue);
          } else {
            const annotationValue = (
              await DocumentAnnotationValueModel.findOne({
                documentAnnotationId: annotationId,
              }).select('value')
            ).value;

            annotationsArray.push(annotationValue);
          }
        });

        // TODO: need to save production document to its appropriate path. With appropriate pages.
        // Copy from following path to destination path.
        const reg = new RegExp(`^${productionDocumentId}_P`);

        const dirCont = fs.readdirSync(
          `C:\\ecdiscoProjects\\Project_${this.projectId}\\Processed`
        );

        const files: string[] = dirCont
          .filter((f) => f.match(new RegExp('*.png', 'ig')))
          .filter((f) => reg.test(path.parse(f).name));

        const productionPath = path.join(
          `C:\\ecdiscoProjects\\Project_${this.projectId}\\Production`,
          productionId.toString()
        );

        if (!fs.existsSync(productionPath)) {
          fs.mkdirSync(productionPath);
        }

        files.forEach((file: string) => {
          const productionFile: string = path.join(
            productionPath,
            path.parse(file).base
          );
          fs.copyFile(file, productionFile, null);
        });

        amqp.connect('amqp://localhost', (connectionError, connection) => {
          connection.createChannel((channelError, channel) => {
            const imageAnnotatorQueue = 'imageAnnotator';

            channel.assertQueue(imageAnnotatorQueue, {
              durable: false,
              exclusive: false,
              autoDelete: false,
              arguments: null,
            });

            channel.sendToQueue(
              imageAnnotatorQueue,
              Buffer.from(
                JSON.stringify({
                  projectId: this.projectId,
                  documentId: productionDocumentId,
                  annotations: annotationsArray,
                })
              )
            );
          });
        });
      }
    });
  }

  private getDocumentIdsByQueryId(queryId: number): number[] {
    let queryRule: QueryRule;

    (async () => {
      queryRule = await QueryRuleModel.findById(queryId);
    })();

    const lookups: $lookup[] = [];
    const whereQuery: any = {};

    new DocumentSearchController().searchQuery(
      queryRule,
      lookups,
      whereQuery,
      queryRule.condition
    );

    // Let tempRunProductionTable: string = 'TempRunProduction_' + productionId;

    const finalQuery = [whereQuery, { $project: { id: 1 } }, ...lookups];

    let DocumentIds: number[] = [];

    async () => {
      DocumentIds = (await DocumentModel.aggregate(finalQuery)).map(
        (document) => document.id
      );
    };

    return DocumentIds;
  }

  @Post('downloadProduction')
  downloadProduction(@Body() production: any): FileResponse {
    // 1  Get Prduction id
    const productionId: number = production.productionId as number;

    const zip = new AdmZip();

    fs.readdir(
      'C:\\ecdiscoProjects\\Project_22\\Production\\1',
      (err, files) => {
        files.forEach((file) => {
          zip.addLocalFile(file);
        });
      }
    );

    return {
      content: zip.toBuffer(), // We could use just Stream, but the compiler gets a warning: 'ObjectDisposedException: Cannot access a closed Stream' then.
      type: 'application/zip',
      name: 'sample.zip',
    };
  }
}
