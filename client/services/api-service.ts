import { AppStore } from '@/app-store';
import Axios from 'axios';

export class ApiService {

  static apiHost = 'http://localhost:3100/';

  static post(url: string, data?: any) {
    return new Promise<any>((resolve, reject) => {
      Axios.post(`${ApiService.apiHost}api/${url}`, data, {
        headers: {
          projectId:
            (data && data.projectId) || AppStore.projectId || window.projectId,
          sessionId: AppStore.sessionId,
        },
      }).then((response) => {
        resolve(response.data);
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
}
