import {
  Datasource,
  DatasourceModel,
} from '../../../../../ecdisco-models/projects/datasource';
import { GoogleAuth } from '../../../../google-auth';
import { MicrosoftAuth } from '../../../../microsoft-auth';
import { Datasources } from '../../../datasources';
import { IAuth } from '../../../i-auth-request';
import { ProjectBaseController } from '../project-base-controller';

import axios, { AxiosRequestConfig } from 'axios';
// import ftpClient from 'ftp';
import {
  AuthToken,
  AuthTokenModel,
} from '../../../../../ecdisco-models/master/auth-token';
import { IAuthToken } from '../../../i-auth-token';
import { Controller } from '@nestjs/common';

@Controller()
export class DatasourceController extends ProjectBaseController {
  getAuthObject(source: Datasources): IAuth {
    switch (source) {
      case Datasources.OneDrive:
        return new MicrosoftAuth();
      case Datasources.GoogleDrive:
        break;
      case Datasources.Box:
        break;
      case Datasources.Facebook:
        break;
      case Datasources.Twitter:
        break;
      case Datasources.Instagram:
        break;
      case Datasources.Youtube:
        break;
      case Datasources.Linkedin:
        break;
      case Datasources.Gmail:
        return new GoogleAuth();
      case Datasources.Yahoo:
        break;
      case Datasources.Outlook:
        break;
      default:
    }
  }

  async getFiles(datasources: Datasource): Promise<string> {
    if ((datasources.id as unknown as number) === 1) {
      return this.getFTPFiles();
    }

    const datasource: Datasource = await DatasourceModel.findById(
      datasources.id
    )
      .select(['authTokenId', 'source'])
      .exec();

    const AuthTokenId: number = datasource.authTokenId;
    const source: Datasources = datasource.source;

    if (AuthTokenId === null) {
      return datasource.source.toString();
    }

    const tokenData: AuthToken = await AuthTokenModel.findById(
      AuthTokenId
    ).select(['accessToken', 'refreshToken', 'dateTime', 'expiresIn']);

    let accessToken: string = tokenData.accessToken;

    const auth: IAuth = this.getAuthObject(source);

    // Compare Expiry time.
    tokenData.dateTime.setSeconds(
      tokenData.dateTime.getSeconds() + tokenData.expiresIn
    );

    if (new Date().getTime() >= tokenData.dateTime.getTime()) {
      const values: IAuth = {
        client_id: auth.client_id,
        redirect_uri: auth.redirect_uri,
        client_secret: auth.client_secret,
        refresh_token: tokenData.refreshToken,
        grant_type: 'refresh_token',
      };

      const data = Object.keys(values)
        .map((key) => `${key}=${encodeURIComponent((values as any)[key])}`)
        .join('&');

      const options: AxiosRequestConfig = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data,
        url: auth.token_uri,
      };

      let tokenDataObject: IAuthToken;

      (async () => {
        tokenDataObject = (await axios(options)).data;
      })();

      accessToken = tokenDataObject.access_token as string;

      AuthTokenModel.findByIdAndUpdate(AuthTokenId, {
        $set: {
          AccessToken: accessToken,
          DateTime: new Date(),
        },
      }).exe();
    }

    if (datasources.filter) {
      // TODO: Make this conmmon config common.
      const options: AxiosRequestConfig = {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        url: `https://graph.microsoft.com/v1.0/me/drive/root/search(q='ecdocs')?filter=${
          datasources.filter as string
        }`,
      };

      let graphResponse;
      (async () => {
        graphResponse = (await axios(options)).data;
      })();

      return graphResponse;
    }

    switch (source) {
      case Datasources.OneDrive:
        const options: AxiosRequestConfig = {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          url: 'https://graph.microsoft.com/v1.0/me/drive/root/children',
        };

        let oneDriveResponse;
        (async () => {
          oneDriveResponse = (await axios(options)).data;
        })();

        return oneDriveResponse;
      case Datasources.GoogleDrive:
        break;
      case Datasources.Box:
        break;
      case Datasources.Facebook:
        break;
      case Datasources.Twitter:
        break;
      case Datasources.Instagram:
        break;
      case Datasources.Youtube:
        break;
      case Datasources.Linkedin:
        break;
      case Datasources.Gmail:
        // Https://developers.google.com/gmail/api/guides
        const gmailOptions: AxiosRequestConfig = {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          url: 'https://www.googleapis.com/gmail/v1/users/me/messages',
        };

        let gmailResponse;
        (async () => {
          gmailResponse = (await axios(gmailOptions)).data;
        })();

        return gmailResponse;
      case Datasources.Yahoo:
        break;
      case Datasources.Outlook:
        break;
      default:
    }

    return null;
  }

  getFTPFiles(): string {
    // TODO: ftp is outdated. Need to find new ftp library for node js.
    return 'Will give you ftp files soon';
  }

  // Static readonly HttpClient httpClient = new HttpClient();

  async SaveDatasource(datasource: Datasource): Promise<number> {
    return (
      await DatasourceModel.findOneAndUpdate(
        { id: datasource.id },
        {
          $set: {
            name: datasource.name,
            type: datasource.type,
            source: datasource.source,
          },
        },
        { upsert: true }
      )
    ).id;
  }
}
