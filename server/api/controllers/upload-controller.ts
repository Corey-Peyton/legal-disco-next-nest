import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as amqp from 'amqplib/callback_api';
import * as fs from 'fs';
import mime from 'mime-types';
import * as path from 'path';
import * as redis from 'redis';
import { Hash } from '../../general/hash/hash';
import { FileChunkMetaData } from './file-chunk-meta-data';
import { FileResult } from './file-result';
// This is a hack to make Multer available in the Express namespace
import { Multer } from 'multer';

@Controller('Upload')
export class UploadController {
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

    const client = redis.createClient({
      port: 6379,
      host: 'fe80::20c:29ff:fec5:a66b',
    });

    const isSystemFile = client.sismember(
      'NSRLHash',
      await Hash.GetHash(filePath),
    );

    if (fileResult.uploaded && !isSystemFile) {
      //TODO: This might require seperate library. to be used from other projects.

      amqp.connect('amqp://localhost', (connectionError, connection) => {
        connection.createChannel((channelError, channel) => {
          const documentProcessQueue = 'DocumentProcess';

          channel.assertQueue(documentProcessQueue, {
            durable: false,
            exclusive: false,
            autoDelete: false,
            arguments: null,
          });

          channel.sendToQueue(
            documentProcessQueue,
            Buffer.from(
              JSON.stringify({
                projectId: fileChunkMetaData.projectId,
                datasourceId: fileChunkMetaData.datasourceId,
                documentPath: filePath,
              }),
            ),
          );
        });
      });
    }

    return fileResult;
  }
}
