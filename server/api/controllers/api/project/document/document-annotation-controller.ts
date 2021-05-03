import { Body, Controller, Post } from '@nestjs/common';
import { DocumentType } from '@typegoose/typegoose/lib/types';
import { KeyValue } from '../../../../../ecdisco-models/general/key-value';
import {
  DocumentAnnotation,
  DocumentAnnotationModel,
} from '../../../../../ecdisco-models/projects/document-annotation';
import {
  DocumentAnnotationValue,
  DocumentAnnotationValueModel,
} from '../../../../../ecdisco-models/projects/document-annotation-value';
import { DocumentAnnotationValueMultiPageModel } from '../../../../../ecdisco-models/projects/document-annotation-value-multi-page';
import { ProjectBaseController } from '../project-base-controller';

@Controller('DocumentAnnotation')
export class DocumentAnnotationController extends ProjectBaseController {
  Annotations(): DocumentAnnotation[][] {
    return [
      this.GetDocumentAnnotation([null], false),
      this.GetDocumentAnnotation([null], true),
    ];
  }

  @Post('documentAnnotationData')
  async documentAnnotationData(
    @Body() documentData: DocumentAnnotationValue,
  ): Promise<KeyValue[]> {
    const documentId: number = documentData.documentId as number;
    const annotationId: number = (documentData.id as unknown) as number;

    if (documentId === -1) {
      return (
        await DocumentAnnotationValueMultiPageModel.find({
          DocumentAnnotationId: annotationId,
        }).exec()
      ).map((davmpm) => ({
        key: -1,
        value: davmpm.value,
      }));
    }

    // TODO: In Old tables were by id.
    return (
      await DocumentAnnotationValueModel.find({ DocumentId: documentId })
        .select(['pageId', 'value'])
        .exec()
    ).map((c) => ({ key: c.pageId, value: c.value }));
  }

  @Post('multiPageAnnotationData')
  async multiPageAnnotationData(@Body() annotationId: number): Promise<string> {
    return (
      await DocumentAnnotationValueMultiPageModel.findOne({
        documentAnnotationId: annotationId,
      })
        .select('value')
        .exec()
    ).value;
  }

  @Post('save')
  save(@Body() annotationData: DocumentAnnotationValue): void {
    const documentId: number = annotationData.documentId;
    const pageId: number = annotationData.pageId;
    const annotationId: number = annotationData.documentAnnotationId;
    const value: string = annotationData.value;

    if (documentId !== -1 && documentId !== null && pageId !== null) {
      if (value) {
        DocumentAnnotationValueModel.findOneAndUpdate(
          {
            documentAnnotationId: annotationId,
            pageId: pageId,
            documentId: documentId,
          },
          {
            $set: {
              documentAnnotationId: annotationId,
              pageId: pageId,
              documentId: documentId,
              value: value,
            },
          },
          { upsert: true },
        ).exec();
      } else {
        // TODO: WithID

        DocumentAnnotationValueModel.deleteOne({
          documentAnnotationId: annotationId,
          pageId: pageId,
          documentId: documentId,
        }).exec();
      }
    } else {
      if (value) {
        DocumentAnnotationValueMultiPageModel.findOneAndUpdate(
          {
            documentAnnotationId: annotationId,
          },
          {
            $set: {
              documentAnnotationId: annotationId,
              value: value,
            },
          },
          { upsert: true },
        ).exec();
      } else {
        DocumentAnnotationValueMultiPageModel.deleteMany({
          documentAnnotationId: annotationId,
        });
      }
    }
  }

  @Post('saveAnnotation')
  saveAnnotation(@Body() annotation: DocumentAnnotation): number {
    return this.SaveAnnotation2(
      annotation.parentId,
      annotation.name,
      annotation.isMultiPage,
    );
  }

  private GetDocumentAnnotation(
    parentIds: number[],
    isMultiPage: boolean,
  ): DocumentType<DocumentAnnotation>[] {
    let documentAnnotations: DocumentType<DocumentAnnotation>[];

    (async () => {
      documentAnnotations = (
        await DocumentAnnotationModel.find({ ParentId: { $in: parentIds } })
          .select(['id', 'name', 'isMultiPage'])
          .exec()
      ).map((da) => {
        da.children = this.GetDocumentAnnotation([da.id], isMultiPage);
        return da;
      });
    })();

    // Return Default annotation if none is there.
    if (
      documentAnnotations.length === 0 &&
      parentIds.length &&
      parentIds[0] === null
    ) {
      this.SaveAnnotation2(null, 'Default', null);
      documentAnnotations = this.GetDocumentAnnotation([null], isMultiPage);
    }

    return documentAnnotations;
  }

  private SaveAnnotation2(
    parentId: number,
    name: string,
    isMultiPage: boolean,
  ): number {
    let id = null;

    (async () =>
      (id = (
        await DocumentAnnotationModel.create({
          name,
          parentId,
          isMultiPage,
        } as DocumentAnnotation)
      ).id))();

    return id;
  }
}
