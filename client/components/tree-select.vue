<template>
  <span>
    <treeselect :options="options" v-model="model" style="width: 230px;float:left;" />
    <i
      v-if="showAddButton"
      class="el-icon-circle-plus"
      style="transform: translateY(50%);margin-left: 10px;"
      @click="$emit('add-click')"
    ></i>
  </span>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import { TreeData } from '../extended-types/tree-data';

@Component({
  components: {
    Treeselect,
  },
})
export default class TreeSelect extends Vue {
  @Prop({ default: false, type: Boolean })
  showAddButton?: boolean;

  @Prop()
  options?: TreeData[];

  @Prop()
  model?: string;
}
</script>
