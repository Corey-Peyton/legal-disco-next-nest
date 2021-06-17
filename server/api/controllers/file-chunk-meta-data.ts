export class FileChunkMetaData {
  chunkNumber: number;
  chunkSize: number;
  currentChunkSize: number;
  totalSize: number;
  identifier: string;
  filename: string;
  relativePath: string;
  totalChunks: number;
  projectId: number;
  datasourceId: number;
  contentType: string
}
