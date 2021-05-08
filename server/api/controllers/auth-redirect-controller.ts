import axios, { AxiosRequestConfig } from 'axios';
import { DatasourceModel } from '../../ecdisco-models/projects/datasource';
import { AuthTokenModel } from '../../ecdisco-models/master/auth-token';
import { GoogleAuth } from '../google-auth';
import { MicrosoftAuth } from '../microsoft-auth';
import { MasterBaseController } from './api/master/master-base-controller';
import { ProjectContext } from './api/master/project-context';
import { Datasources } from './datasources';
import { IAuth } from './i-auth-request';
import { IAuthToken } from './i-auth-token';
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('AuthRedirect')
export class AuthRedirectController extends MasterBaseController {

  @Get()
  async indexes(@Req() req: Request, @Res() res: Response): Promise<void> {

    this.masterContext;

    const state: string[] = req.query.state.toString().split('_');
    const projectId = Number(state[0]);
    const datasourceId: string = state[1];

    // Store above token values in db and redirect to In Page

    const projectConnection = new ProjectContext();
    projectConnection.projectId = projectId;

    const projectContext = projectConnection.context;

    const datasources = (await DatasourceModel.findById(datasourceId).select(
      'source'
    )).source;

    let auth: IAuth = null;

    switch (datasources) {
      case Datasources.OneDrive:
        auth = new MicrosoftAuth();
        break;
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
        auth = new GoogleAuth();
        break;
      case Datasources.Yahoo:
        break;
      case Datasources.Outlook:
        break;
      default:
    }

    const values = {
      'Content-Type': 'application/x-www-form-urlencoded',
      client_id: auth.client_id,
      redirect_uri: auth.redirect_uri,
      client_secret: auth.client_secret,
      code: req.query.code,
      grant_type: 'authorization_code',
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

    const tokenData: IAuthToken = JSON.parse((await axios(options)).data);

    const tokenId = (
      await AuthTokenModel.create({
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        scope: tokenData.scope,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        dateTime: new Date(),
      })
    ).id;

    DatasourceModel.findByIdAndUpdate(datasourceId, {
      $set: { authTokenId: tokenId },
    });

    return res.redirect(
      `https://localhost:44375/in/project/${projectId.toString()}/datasource/${
        state[1]
      }?state=${state[2]}`
    );
  }

  refreshToken() {
    //            POST https://login.microsoftonline.com/common/oauth2/v2.0/token
    // Content - Type: application / x - www - form - urlencoded
    // Client_id ={ client_id}
    //            &redirect_uri ={ redirect_uri}
    //            &client_secret ={ client_secret}
    //            &refresh_token ={ refresh_token}
    //            &grant_type = refresh_token
  }
}
