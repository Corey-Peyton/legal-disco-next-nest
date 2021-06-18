import fs from 'fs';
import crypto from 'crypto';
const sha1 = crypto.createHash('sha1');

export class Hash {
  static GetHash(path: string): Promise<string> {
    return new Promise((resolve) => {
      const input = fs.createReadStream(path);

      input.on('data', function (chunk) {
        sha1.update(chunk);
      });

      input.on('close', function () {
        resolve(sha1.digest('hex'));
      });
    });
  }
}
