import axios from 'axios';
import crypto from 'crypto';
import fs, { createWriteStream } from 'fs';
import cron from 'node-cron';
import path from 'path';
import { RabbitMQ } from '~/general/rabbitmq/rabbitmq';
import { Hash } from '../general/hash/hash';

const sha1 = crypto.createHash('sha1');

cron.schedule('0 0 9 MAR,JUN,SEP,DEC *', function () {
  NSRL.Execute();
});

export class NSRL {
  static async Execute() {
    const source = 'https://s3.amazonaws.com/rds.nsrl.nist.gov/RDS/';
    const destination = '\\\\DESKTOP-GJPEFGP\\ecdiscoMaster\\NSRL\\';
    const currentRDSDirectory: string = path.join(destination, 'current');
    const versionTextFilePath: string = path.join(
      currentRDSDirectory,
      'version.txt',
    );

    if (
      (await this.GetHashFromURL(`${source}current/version.txt`)) !==
      (await Hash.GetHash(versionTextFilePath))
    ) {
      const pastRDSDirectory: string = path.join(destination, 'rds_2.65');

      fs.mkdirSync(currentRDSDirectory);
      fs.mkdirSync(pastRDSDirectory);

      // Download from following.
      // https://www.nist.gov/itl/ssd/software-quality-group/national-software-reference-library-nsrl/nsrl-download/current-rds
      this.downloadFile(`${source}current/version.txt`, versionTextFilePath);
      this.downloadFile(
        `${source}current/rds_modernm.zip`,
        path.join(currentRDSDirectory, 'rds_modernm.zip'),
      );
      this.downloadFile(
        `${source}current/RDS_android.iso`,
        path.join(currentRDSDirectory, 'RDS_android.iso'),
      );
      this.downloadFile(
        `${source}rds_2.65/RDS_android.iso`,
        path.join(pastRDSDirectory, 'RDS_android.iso'),
      );
      this.downloadFile(
        `${source}current/RDS_ios.iso`,
        path.join(currentRDSDirectory, 'RDS_ios.iso'),
      );
      this.downloadFile(
        `${source}current/RDS_legacy.iso`,
        path.join(currentRDSDirectory, 'RDS_legacy.iso'),
      );

      // Send ecdiscoextract project a request to update redis from their file.
      RabbitMQ.sendToQueue('UpdateNSRL', null);

    }
  }

  static async GetHashFromURL(url: string) {
    const responseData = (
      await axios({ method: 'get', url, responseType: 'stream' })
    ).data;
    return sha1.update(responseData).digest('hex');
  }

  static downloadFile(fileUrl: string, outputLocationPath: string) {
    const writer = createWriteStream(outputLocationPath);

    return axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    }).then((response) => {
      //ensure that the user can call `then()` only when the file has
      //been downloaded entirely.

      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error: Error = null;
        writer.on('error', (err) => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on('close', () => {
          if (!error) {
            resolve(true);
          }
          //no need to call the reject here, as it will have been called in the
          //'error' stream;
        });
      });
    });
  }
}
