<template>
  <el-button @click="startOAuth2()">Grant Permission</el-button>
</template>

<script lang="ts">
import { Datasources } from '@/models/datasource-type';
import { ApiService } from '@/services/api-service';
import { Button } from 'element-ui';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

interface auth2 {
  client_id: string,
  authorizationUri: string,
  redirect_uri: string,
  scope: string,
  queryParams?: any
}

@Component({
  components: {
    ElButton: Button
  }
})
export default class Auth2 extends Vue {

  config!: auth2;

  MicrosoftOAuth2Config: auth2 = {
    client_id: '955783b9-8d37-412f-a32e-d0c385cdd686',
    authorizationUri:
      'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    redirect_uri: `${ApiService.apiHost}/authredirect`,
    scope: 'Files.ReadWrite.All offline_access',
  };

  GoogleOAuth2Config: auth2 = {
    client_id: '270840670535-rrb78bln6hgqiji47e7ujocin7im33hf.apps.googleusercontent.com',
    authorizationUri:
      'https://accounts.google.com/o/oauth2/v2/auth',
    redirect_uri: `${ApiService.apiHost}/authredirect`,
    scope: 'profile email gmail.readonly',
    queryParams: { 'access_type': 'offline' }
  };

  //https://developers.facebook.com/docs/apps/#register
  FacebookOAuth2Config: auth2 = {
    client_id: '270840670535-rrb78bln6hgqiji47e7ujocin7im33hf.apps.googleusercontent.com',
    authorizationUri:
      'https://www.facebook.com/v8.0/dialog/oauth',
    redirect_uri: `${ApiService.apiHost}/authredirect`,
    scope: 'profile email gmail.readonly',
    queryParams: { 'access_type': 'offline' }
  };

  @Prop()
  private masterDatasourceId!: number;

  @Watch('masterDatasourceId', { immediate: true })
  masterDatasourceIdChanged(newVal: number) {
    switch (newVal) {
      case Datasources.OneDrive:
        this.config = this.MicrosoftOAuth2Config;
        break;
      case Datasources.Gmail:
        this.config = this.GoogleOAuth2Config;
        break;
    }
  }

  @Prop()
  projectId!: number;

  @Prop()
  datasourceId!: number;

  // Start OAuth 2
  startOAuth2() {

    ApiService.post('Datasource/GetNewState')
      .then((state) => {

        const randomState = `${this.projectId}_${this.datasourceId}_${state}`;

        const url = this.buildAuthorizationUrl(randomState);
        // tslint:disable-next-line: max-line-length
        window.location.href = url; // Redirect is cleaner. https://security.stackexchange.com/questions/158594/is-there-any-security-difference-between-login-via-iframe-pop-up-or-redirect
      });

  }

  buildAuthorizationUrl(randomState: string | number | boolean) {

    let authUrl = `${this.config.authorizationUri}?${new URLSearchParams({
      'response_type': 'code',
      'redirect_uri': this.config.redirect_uri,
      'client_id': encodeURIComponent(this.config.client_id),
      'state': encodeURIComponent(randomState)
    })}`;

    authUrl += '&scope=' + encodeURIComponent(this.config.scope);

    if (this.config.queryParams) {
      authUrl += `&${new URLSearchParams(this.config.queryParams).toString()}`;
    }

    return authUrl;
  }
}
</script>