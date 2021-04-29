import { AppStore } from '@/app-store';
import Annotator from '@/components/annotator/annotator.vue';
import Toolbar from '@/components/toolbar.vue';
import TreeSelect from '@/components/tree-select.vue';
import { TreeData } from '@/extended-types/tree-data';
import { NodeType } from '@/models/node-type';
import { Production } from '@/models/production';
import { ProductionAnnotationFilter } from '@/models/production-annotation-filter';
import { ApiService } from '@/services/api-service';
import { CommonCRUDService } from '@/services/common-crud-service/common-crud-service';
import { eventBus } from '@/services/event-bus';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import {
  Button, Col, Collapse, CollapseItem, Divider, Form, FormItem, InputNumber, Link,
  Menu, MenuItemGroup, Radio, Row, Submenu, Table, TableColumn, Tree
} from 'element-ui';
import { TreeNode } from 'element-ui/types/tree';
import { saveAs } from 'file-saver';
import { Pane, Splitpanes } from 'splitpanes';
import VueContext from 'vue-context';
import 'vue-context/dist/css/vue-context.css';
import { Drag } from 'vue-drag-drop';
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {
    Annotator, Drag, ElButton: Button, Col, Collapse, CollapseItem, Divider, ElForm: Form, FormItem,
    InputNumber, Link, Menu, MenuItemGroup, Radio, Row, Submenu, ElTable: Table, TableColumn, Tree,
    Pane, Splitpanes, Treeselect, TreeSelect, Toolbar, VueContext
  }
})
export default class Out extends Vue {

  get annotationFields(): TreeData[] {
    return AppStore.docFields.filter((x) =>
      x.nodeType === NodeType.DocumentMetadata || x.nodeType === NodeType.DocumentField) || [];
  }
  get annotationFilter(): TreeData[] {
    return [AppStore.searches];
  }

  get annotations(): TreeData[] {
    return [AppStore.annotations];
  }

  // TODO: following is temporary
  set annotations(treedata: TreeData[]) {
    this.docFields = treedata;
  }

  get outTree(): TreeData[] {
    return [AppStore.multiPageannotations, AppStore.productions];
  }

  get productions(): TreeData[] {
    return [AppStore.productions];
  }
  activeNames = ['1'];

  annotationData = [{ name: '', tree: null }];

  annotationFilterTreeNode = '';
  annotationsKey = 0;

  annotationTreeNode = '';
  dialogVisible = false;

  docFields: TreeData[] = [];
  editNodeId = 0;
  editNodeType: NodeType | null = null;

  isImage = false;
  isNative = false;
  multiPageAnnotationName = '';
  multiPageAnnotationTreeNode = '';
  nodeType = NodeType;
  production: Production = {
    queryId: 0,
    includeNative: false,
    includeImage: false,
    productionAnnotationFilter: [] as ProductionAnnotationFilter[],
  } as Production;

  productionName = '';
  productionTreeNode = '';
  searchesKey = 0;
  showSaveAnnotation = false;

  add(node: TreeNode<any, TreeData>, data: TreeData) {
    const newChild = { label: '', children: [], isAdd: true };
    data.children!.push(newChild);
    node.expanded = true;
  }

  addRow() {
    this.production.productionAnnotationFilter.push({
      queryId: null as unknown as number, annotationId: null as unknown as number
    } as ProductionAnnotationFilter);
  }

  created() {
    this.docFields = AppStore.docFields;
  }

  deleteRow(index: number, productionAnnotationFilters: ProductionAnnotationFilter[]) {

    CommonCRUDService.delete('productionAnnotationFilter', { id: productionAnnotationFilters[index].id });
    productionAnnotationFilters.splice(index, 1);
  }

  downloadProduction() {
    ApiService.postForBlob('production/downloadProduction', { productionId: this.production.id })
    .then((response) => {
      const blob = new Blob([response], { type: 'application/octet-stream' });
      const fileName = 'Production.zip';
      saveAs(blob, fileName);
    });
  }

  edit(data: TreeData) {
    this.editNodeType = data.nodeType!;
    data.isEdit = true;
    this.editNodeId = Number(data.id.split('_')[1]);

    switch (this.editNodeType) {
      case NodeType.Production:
        ApiService.post('production/production', {
          productionId: this.editNodeId
        })
        .then((production: Production) => {
          this.production = production;
        });
    }
  }

  mounted() {
    // TODO: Force update. temporary fix. may be with vuex this fixes.
    eventBus.$on('SearchesRetrieved', () => {
      this.searchesKey += 1;
    });
    eventBus.$on('AnnotationsRetrieved', () => {
      this.annotationsKey += 1;
    });
  }

  // TODO: Need to check parameters of TreeNode which is currently any, any.
  remove(node: TreeNode<any, TreeData>, data: TreeData) {
    const children = node.parent!.data.children!;
    const dataId = data.id;
    const index = children.indexOf(dataId);
    const id = Number(dataId.split('_')[1]);
    children.splice(index, 1);

    switch (this.editNodeType) {
      case NodeType.Production:
        ApiService.post('production/deleteProduction', { productionId: id });
        break;
      case NodeType.MultiPageAnnotation:
        ApiService.post('annotation/deleteAnnotation', { annotationId: id });
    }
  }

  runProduction(node: TreeNode<any, TreeData>, data: TreeData) {
    const dataId = data.id;
    const id = Number(dataId.split('_')[1]);
    ApiService.post('production/runProduction', { productionId: id });
  }

  // TODO: Need to check parameters of TreeNode which is currently any.
  saveOrDiscard(node: TreeNode<any, TreeData>, data: TreeData) {
    const parentNode = node.parent!;

    // If empty, discard.
    if (data.label !== null && !data.label!.length) {
      this.remove(node, data);

      return;
    }

    data.isAdd = false;
    data.isEdit = false;

    let query = '';
    const params: any = {
      parentId: parentNode.data.id.split('_')[1],
      name: data.label,
    };

    switch (parentNode.data.nodeType) {
      case NodeType.MultiPageAnnotation:
        // TODO: in following, we also need to save userid. so that user project association can be there.
        query = 'documentAnnotation/saveAnnotation';
        params.isMultiPage = true;
        break;
      case NodeType.Production:
        // TODO: In following we need to pass project id. so that datasource can be associated.
        query = 'production/saveProduction';
        break;
      default:
    }

    // TODO: Define axios graphql base url.
    ApiService.post(query, params)
      .then((savedId: number) => {
        switch (parentNode.data.nodeType) {
          case NodeType.MultiPageAnnotation:
            data.id = savedId;
            break;
          case NodeType.Production:
            data.id = savedId;
        }
      });
  }

  updateProductionAnnotationFilterField(fieldName: string, index: number, node: any) {

    let fieldObject: any;
    switch (fieldName) {
      case 'annotationId':
        fieldObject = { annotationId: Number(this.production.productionAnnotationFilter[index].annotationId) };
        break;
      case 'queryId':
        fieldObject = { queryId: this.production.productionAnnotationFilter[index].queryId };
    }

    fieldObject.productionId = this.production.id;

    CommonCRUDService.fieldsUpsert('productionAnnotationFilter', fieldObject, {
      id: this.production.productionAnnotationFilter[index].id
    });
  }

  updateProductionField(fieldName: any) {
    let fieldObject: any;
    switch (fieldName) {
      case 'queryId':
        fieldObject = { queryId: this.production.queryId };
        break;
      case 'includeNative':
        fieldObject = { includeNative: this.production.includeNative };
        break;
      case 'includeImage':
        fieldObject = { includeImage: this.production.includeImage };
    }
    CommonCRUDService.fieldsUpsert('production', fieldObject, { id: this.production.id });
  }
}
