import fs from 'fs';
import crypto from 'crypto';

export class Hash {
  static GetHash(path: string): Promise<string> {
    return new Promise((resolve) => {
      const input = fs.createReadStream(path);
      const sha1 = crypto.createHash('sha1');

      input.on('data', (chunk) => {
        sha1.update(chunk);
      });

      input.on('close', () => {
        resolve(sha1.digest('hex'));
      });
    });
  }
}
