import { AppStore } from '@/app-store';
import Axios from 'axios';
import Oidc from 'oidc-client';
import { auth2, AuthConfig } from '@/config/auth-config';

export class ApiService {
  static apiHost = 'https://localhost:3100/';

  static mgr = new Oidc.UserManager(
    new AuthConfig().IdentityServerOAuth2Config,
  );

  static async post(url: string, data?: any) {
    let user = await ApiService.mgr.getUser();

    let headers: any = {
      projectId:
        (data && data.projectId) || AppStore.projectId || window.projectId,
      sessionId: AppStore.sessionId,
    };

    if (user) {
      headers.Authorization = `Bearer ${user.access_token}`;
    }

    return new Promise<any>((resolve, reject) => {
      Axios.post(`${ApiService.apiHost}api/${url}`, data, {
        headers,
      })
        .then((response) => {
          resolve(response.data);
        })
        .catch((response) => {
          window.location.replace('/api/login');
        });
    });
  }

  static postForBlob(url: string, data?: any) {
    return new Promise<any>((resolve, reject) => {
      Axios.post(`${ApiService.apiHost}/api/${url}`, data, {
        headers: {
          projectId:
            (data && data.projectId) || AppStore.projectId || window.projectId,
          sessionId: AppStore.sessionId,
        },
        responseType: 'blob',
      }).then((response) => {
        resolve(response.data);
      });
    });
  }

  static buildAuthorizationUrl(
    randomState: string | number | boolean,
    config: auth2,
  ) {
    let authUrl = `${config.authorizationUri}?${new URLSearchParams({
      response_type: 'code',
      redirect_uri: config.redirect_uri,
      client_id: encodeURIComponent(config.client_id),
      ClientId: encodeURIComponent(config.ClientId),
      state: encodeURIComponent(randomState),
    })}`;

    authUrl += '&scope=' + encodeURIComponent(config.scope);

    if (config.queryParams) {
      authUrl += `&${new URLSearchParams(config.queryParams).toString()}`;
    }

    return authUrl;
  }
}
