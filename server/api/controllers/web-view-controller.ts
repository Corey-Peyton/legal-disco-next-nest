import path from 'path';
import fs from 'fs';
import { FileResponse } from '../../ecdisco-models/general/file-response';
import { Controller } from '@nestjs/common';

@Controller('WebView')
export class WebViewController {

  index(file: string): FileResponse {
    if (!path.extname(file)) {
      const doc = fs.readFileSync(
        'C:\\ecdiscoProjects\\Project_22\\Processed\\10\\1026_P1_png.html'
      );

      return {
        content: doc, // We could use just Stream, but the compiler gets a warning: 'ObjectDisposedException: Cannot access a closed Stream' then.
        type: 'text/html',
        name: file,
      };
    } else {
      const doc = fs.readFileSync(
        `C:\\ecdiscoProjects\\Project_22\\Processed\\10\\${file}`
      );

      return {
        content: doc, // We could use just Stream, but the compiler gets a warning: 'ObjectDisposedException: Cannot access a closed Stream' then.
        type: 'application/unknown',
        name: file,
      };
    }
  }
}
