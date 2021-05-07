<template>
  <el-button @click="startOAuth2()">Grant Permission</el-button>
</template>

<script lang="ts">
import { Datasources } from '@/models/datasource-type';
import { ApiService } from '@/services/api-service';
import { Button } from 'element-ui';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { AuthConfig, auth2 } from '@/config/auth-config';


@Component({
  components: {
    ElButton: Button
  }
})
export default class Auth2 extends Vue {

  config!: auth2;

  @Prop()
  private masterDatasourceId!: number;

  @Watch('masterDatasourceId', { immediate: true })
  masterDatasourceIdChanged(newVal: number) {
    switch (newVal) {
      case Datasources.OneDrive:
        this.config = new AuthConfig().MicrosoftOAuth2Config;
        break;
      case Datasources.Gmail:
        this.config = new AuthConfig().GoogleOAuth2Config;
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

        const url = ApiService.buildAuthorizationUrl(randomState, this.config);
        // tslint:disable-next-line: max-line-length
        window.location.href = url; // Redirect is cleaner. https://security.stackexchange.com/questions/158594/is-there-any-security-difference-between-login-via-iframe-pop-up-or-redirect
      });

  }

}
</script>