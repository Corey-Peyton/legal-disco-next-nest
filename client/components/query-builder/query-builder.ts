import { Component, Vue, Prop } from 'vue-property-decorator';
import NodeTree from './query-node.vue';

//import { TreeData } from 'element-ui/types/tree'; // TODO: Nuxt is not able to get this somehow, even if it is present.
import { QueryGroup } from '../../models/query-builder-query';

// TODO: Move this and querynode to its own folder
@Component({
  components: {
    NodeTree,
  },
})
export default class QueryBuilder extends Vue {
  @Prop({ default: () => null })
  rule?: QueryGroup;
  // TODO: Following data is only for demo. Remove it. and set appropriate.
  @Prop()
  // filterTreeData?: TreeData;
  filterTreeData?: any;

  @Prop({type: Boolean})
  simple?: boolean;
}