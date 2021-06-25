import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import fs from 'fs';
import mime from 'mime-types';
import { Multer } from 'multer'; // DO NOT REMOVE THIS TILL TYPING IS FIXED. IT GIVES TYPE ERROR. This is a hack to make Multer available in the Express namespace
import { GridFSBucket, ObjectID } from 'mongodb';
import path from 'path';
import { NSRLHashModel } from '~/ecdisco-models/projects/NSRLHash';
import { RabbitMQ } from '~/general/rabbitmq/rabbitmq';
import { Hash } from '../../general/hash/hash';
import { MasterBaseController } from './api/master/master-base-controller';
import { ProjectBaseController } from './api/project/project-base-controller';
import { FileChunkMetaData } from './file-chunk-meta-data';
import { FileResult } from './file-result';

@Controller('Upload')
export class UploadController extends MasterBaseController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async index(
    @UploadedFile() fileChunk: Express.Multer.File,
    @Body() fileChunkMetaData: FileChunkMetaData,
  ): Promise<FileResult> {
    // Here first check nist list. and filter them.
    //https://www.nist.gov/itl/ssd/software-quality-group/national-software-reference-library-nsrl
    // In above link there is download link as well.
    //https://www.nist.gov/itl/ssd/software-quality-group/national-software-reference-library-nsrl/nsrl-download

    fileChunkMetaData.contentType = mime.lookup(
      fileChunkMetaData.filename,
    ) as string;

    //TODO: Folder upload not working.
    const filePath = path.join(
      'C:\\ecdiscoProjects', //TODO: This path will be from Database.
      `Project_${fileChunkMetaData.projectId}`,
      'Source',
      `Datasource_${fileChunkMetaData.datasourceId}`,
      fileChunkMetaData.relativePath,
    );

    const directoyName = path.dirname(filePath);

    await fs.promises.mkdir(directoyName, { recursive: true });

    const fileStream = fs.createWriteStream(filePath, {
      flags: 'a+',
      start: (fileChunkMetaData.chunkNumber - 1) * fileChunkMetaData.chunkSize,
    });

    fileStream.write(fileChunk.buffer);

    const fileResult: FileResult = {
      uploaded:
        fileChunkMetaData.totalChunks - 1 <= fileChunkMetaData.chunkNumber,
      fileUid: fileChunkMetaData.identifier,
    };

    if (fileResult.uploaded) {
      const isSystemFile = await NSRLHashModel(
        await this.masterContext,
      ).findOne({ documentHash: await Hash.GetHash(filePath) });

      if (!isSystemFile) {
        //TODO: This might require seperate library. to be used from other projects.
        const projectController = new ProjectBaseController();
        const projectContext = await projectController.projectContext(
          fileChunkMetaData.projectId,
        );

        const documentId = new ObjectID();

        const bucket = new GridFSBucket(projectContext.db, {
          bucketName: 'DocumentFile',
        });

        fs.createReadStream(filePath)
          .pipe(bucket.openUploadStream(documentId.toString()))
          .on('finish', async () => {
            RabbitMQ.sendToQueue('DocumentProcess', {
              documentId,
              projectId: fileChunkMetaData.projectId,
              datasourceId: fileChunkMetaData.datasourceId,
              documentPath: filePath,
            });
          });
      }
    }

    return fileResult;
  }
}
