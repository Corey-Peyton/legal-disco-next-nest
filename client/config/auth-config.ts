import { ApiService } from '@/services/api-service';

export interface auth2 {
  client_id?: string;
  ClientId?: string;
  authorizationUri: string;
  redirect_uri: string;
  scope: string;
  queryParams?: any;
}

export class AuthConfig {
  IdentityServerOAuth2Config: auth2;
  MicrosoftOAuth2Config: auth2;
  GoogleOAuth2Config: auth2;
  //https://developers.facebook.com/docs/apps/#register
  FacebookOAuth2Config: auth2;

  constructor() {
    this.IdentityServerOAuth2Config = {
      authorizationUri: 'https://localhost:5001/Account/Login',
      client_id: 'js',
      redirect_uri: `${ApiService.apiHost}/authredirect`,
      scope: 'openid profile api1',
    };

    this.MicrosoftOAuth2Config = {
      client_id: '955783b9-8d37-412f-a32e-d0c385cdd686',
      authorizationUri:
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      redirect_uri: `${ApiService.apiHost}/authredirect`,
      scope: 'Files.ReadWrite.All offline_access',
    };

    this.GoogleOAuth2Config = {
      client_id:
        '270840670535-rrb78bln6hgqiji47e7ujocin7im33hf.apps.googleusercontent.com',
      authorizationUri: 'https://accounts.google.com/o/oauth2/v2/auth',
      redirect_uri: `${ApiService.apiHost}/authredirect`,
      scope: 'profile email gmail.readonly',
      queryParams: { access_type: 'offline' },
    };

    //https://developers.facebook.com/docs/apps/#register
    this.FacebookOAuth2Config = {
      client_id:
        '270840670535-rrb78bln6hgqiji47e7ujocin7im33hf.apps.googleusercontent.com',
      authorizationUri: 'https://www.facebook.com/v8.0/dialog/oauth',
      redirect_uri: `${ApiService.apiHost}/authredirect`,
      scope: 'profile email gmail.readonly',
      queryParams: { access_type: 'offline' },
    };
  }
}
