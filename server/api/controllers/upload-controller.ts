import * as amqp from 'amqplib/callback_api';
import * as fs from 'fs';
import * as path from 'path';
import * as redis from 'redis';
import { Hash } from '../../general/hash/hash';
import { ChunkMetaData } from './chunk-meta-data';
import { FileResult } from './file-result';
import mime from 'mime-types';
import { Controller } from '@nestjs/common';

@Controller()
export class UploadController {
  async Index(
    file: any,
    chunkNumber: number,
    chunkSize: number,
    currentChunkSize: number,
    totalSize: number,
    identifier: string,
    filename: string,
    relativePath: string,
    totalChunks: number,
    projectId: number,
    datasourceId: number
  ): Promise<FileResult> {
    // Here first check nist list. and filter them.
    //https://www.nist.gov/itl/ssd/software-quality-group/national-software-reference-library-nsrl
    // In above link there is download link as well.
    //https://www.nist.gov/itl/ssd/software-quality-group/national-software-reference-library-nsrl/nsrl-download

    const chunkData: ChunkMetaData = {
      UploadUid: identifier,
      FileName: filename,
      RelativePath: relativePath,
      ChunkIndex: chunkNumber,
      TotalChunks: totalChunks,
      TotalFileSize: totalSize,
      ContentType: mime.lookup(filename) as string,
    };

    //TODO: Folder upload not working.
    const filePath = path.join(
      'C:\\ecdiscoProjects', //TODO: This path will be from Database.
      `Project_${projectId}`,
      'Source',
      `Datasource_${datasourceId}`,
      chunkData.RelativePath
    );

    const directoyName = path.dirname(filePath);

    if (!fs.existsSync(directoyName)) {
      fs.mkdirSync(directoyName);
    }

    const fileStream = fs.createWriteStream(filePath, {
      flags: 'a+',
      start: (chunkData.ChunkIndex - 1) * chunkSize,
    });

    fileStream.write(file);

    const fileResult: FileResult = {
      uploaded: chunkData.TotalChunks - 1 <= chunkData.ChunkIndex,
      fileUid: chunkData.UploadUid,
    };
    const client = redis.createClient({
      port: 6379,
      host: 'fe80::20c:29ff:fec5:a66b',
    });

    const isSystemFile = client.sismember(
      'NSRLHash',
      await Hash.GetHash(filePath)
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
                projectId,
                datasourceId,
                documentPath: filePath,
              })
            )
          );
        });
      });
    }

    return fileResult;
  }
}
