import NavBar from '@/components/nav-bar.vue';
import VerticalContainer from '@/components/vertical-container.vue';
import '@/styles/dark-theme.scss';
import '@/styles/ecdisco-standard.scss';
import 'element-theme-dark';
import 'nprogress/nprogress.css';
import 'splitpanes/dist/splitpanes.css';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { AppStore } from './app-store';

@Component({
  components: {
    NavBar, VerticalContainer,
  },
})
// tslint:disable-next-line: no-default-export
export default class App extends Vue {
  constructor() {
    super();

    AppStore.sessionId = new Date().valueOf();
    window.addEventListener('beforeunload', (e) => {
      AppStore.beforeAppUnloadHandler();
      // The absence of a returnValue property on the event will guarantee the browser unload happens
      delete e.returnValue;
    });
  }

  @Watch('$route', { immediate: true, deep: true })
  onUrlChange(newVal: Route) {
    if (newVal.params.projectId) {
      AppStore.projectId = Number(newVal.params.projectId);
    }
  }
}
