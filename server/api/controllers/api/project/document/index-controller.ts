import { Client } from '@elastic/elasticsearch';
import path from 'path';
import * as fs from 'fs';
import { Controller } from '@nestjs/common';

@Controller()
export class IndexController {
  async Index(textFileName: any): Promise<void> {
    const client = new Client();

    //https://www.elastic.co/blog/found-multi-tenancy

    //https://stackoverflow.com/a/39540955/9263418

    //https://www.elastic.co/guide/en/elasticsearch/client/net-api/current/routing-inference.html

    let directoryInfo = path.dirname(textFileName.textFileName);
    const directories = directoryInfo.split(path.sep);
    while (!directoryInfo.startsWith('Project_')) {
        directoryInfo = directories.pop();
    }

    const routingFromInt = Number(directoryInfo.split('_')[1]); //TODO: This is project id.

    //1) Indexing
    //Second, you need to add the routing value when you index your document, like this:

    const documentId = Number(
      path.basename(textFileName.textFileName).split('_')[0]
    );

    client.index({
      id: documentId.toString(),
      index: 'project_documents',
      body: {
        id: documentId,
        Content: fs.readFileSync(textFileName.textFileName),
      },
      routing: routingFromInt.toString(),
    });

    //2) TODO: Remove this from here. This is just for testing. This appliction only do indexing. Not for searching.
    //TODO: Following returns 0. so might be issue with indexing itself.
    const elasticSearchResponse = await client.search({
      body: {
        match_all: {},
      },
      routing: routingFromInt.toString(),
    });

    const documents = elasticSearchResponse.body.Documents;

    console.log(`Indexed: ${textFileName}`);
  }
}
