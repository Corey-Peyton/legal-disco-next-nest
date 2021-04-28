import { AppStore } from '@/app-store';
import Annotator from '@/components/annotator/annotator.vue';
import QueryBuilder from '@/components/query-builder/query-builder.vue';
import Toolbar from '@/components/toolbar.vue';
import Transfer from '@/components/transfer/transfer.vue';
import { Condition } from '@/enums/condition';
import { FieldType } from '@/enums/field-type';
import { Operation } from '@/enums/operation';
import { DocFieldsTreeData } from '@/extended-types/doc-fields-tree-data';
import { TreeData } from '@/extended-types/tree-data';
import { findById } from '@/methods/find';
import { updateValue } from '@/methods/update-value';
import { DocumentField } from '@/models/document-field';
import { KeyValue } from '@/models/key-value';
import { NodeType } from '@/models/node-type';
import { Paginate } from '@/models/paginate';
import { QueryGroup, QueryRule as QueryRule } from '@/models/query-builder-query';
import { QueryGroup as QueryGroup2 } from '@/models/query-group';
import { QueryRule as QueryRule2 } from '@/models/query-rule';
import { UserColumn } from '@/models/user-column';
import { ApiService } from '@/services/api-service';
import { CommonCRUDService } from '@/services/common-crud-service/common-crud-service';
import { eventBus } from '@/services/event-bus';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import {
  Button, Checkbox, DatePicker, Dialog, Form, FormItem, Input, InputNumber,
  Menu, MenuItem, MenuItemGroup, Pagination, Radio, Row, Table, TableColumn, Tag, Tree
} from 'element-ui';
import { TreeNode } from 'element-ui/types/tree';
import 'quill/dist/quill.bubble.css';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import { Pane, Splitpanes } from 'splitpanes';
import VueContext from 'vue-context';
import 'vue-context/dist/css/vue-context.css';
import VueGridLayout from 'vue-grid-layout';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { quillEditor } from 'vue-quill-editor';

enum WorkModules {
  Results,
  Search
}

@Component({
  components: {
    Annotator, VueContext, ElButton: Button, Checkbox, DatePicker, Dialog, ElForm: Form, FormItem,
    ElInput: Input, InputNumber, Menu, MenuItem, MenuItemGroup, Radio, Row, ElTable: Table, Tag,
    Tree, Pagination, TableColumn, Transfer, GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem, Pane, Splitpanes, Toolbar, Treeselect, QueryBuilder,
    quillEditor,
  }
})
export default class Work extends Vue {

  get searches(): TreeData[] {
    return [AppStore.searches];
  }

  get searchTree(): TreeData[] {
    return [AppStore.searches];
  }

  get selectedAnnotationId(): string {

    if (this.zSelectedAnnotationId === '') {
      this.selectedAnnotationId = AppStore.docFields.find((x) => x.nodeType === NodeType.Annotation)?.children![0].id;
    }

    return this.zSelectedAnnotationId;
  }

  set selectedAnnotationId(annotationNodeId: string) {
    this.zSelectedAnnotationId = annotationNodeId;
    this.annotationId = Number(annotationNodeId.split('_')[1]);
  }

  allowHTML = false;
  annotationId = 0;
  dataTypes = [
    { name: 'Checkbox', id: FieldType.Checkbox },
    { name: 'DateTime', id: FieldType.DateTime },
    { name: 'Number', id: FieldType.Number },
    { name: 'Radio', id: FieldType.Radio },
    { name: 'Tag', id: FieldType.Tag },
    { name: 'Text', id: FieldType.Text },
  ];
  dialogTitle = '';
  dialogVisible = false;
  documentField: DocFieldsTreeData[] = [];
  documentPaginate: Paginate = {
    currentPage: 1,
    pageSize: 100,
    total: 0,
  };
  documents: any[] = [];
  editSearchId = 0;
  fieldType = FieldType;

  isCollapse = true;

  multipleSelection = [];
  nodeType = NodeType;

  rule: QueryGroup = {
    condition: Condition.And,
    rules: [],
  };
  searchesKey = 0;
  searchName = '';
  searchTreeNode = '';
  selectedColumns: TableColumn[] = [{ label: 'Id', prop: 'id', showOverflowTooltip: true } as TableColumn];
  selectedDocumentId = 0;

  selectedTab: WorkModules = WorkModules.Results;
  showSaveSearch = false;
  tagInputValue = '';

  validSearch = false;

  workModules = WorkModules;

  private lazySaveTimeout: NodeJS.Timeout;
  private zSelectedAnnotationId = '';

  add(node: TreeNode<any, TreeData>, data: TreeData) {
    const newChild: TreeData = { label: '', children: [], isAdd: true };

    if (data.nodeType === NodeType.Annotation) {
      newChild.nodeType = NodeType.Annotation;
      newChild.predefinedType = true;
      newChild.fieldType = FieldType.Radio;
      newChild.value = this.selectedAnnotationId;
    }

    if (data.children === null) {
      data.children = [];
    }

    data.children!.push(newChild);
    node.expanded = true;
  }

  created() {
    this.documentField = AppStore.docFields;
  }

  differentiaRules(rule: QueryGroup2) {

    const formattedRule: QueryGroup2 = rule;
    formattedRule.rules = new Array(rule.childrenQueryGroup!.length + rule.queryRule!.length);

    rule.childrenQueryGroup!.forEach((element) => {
      formattedRule.rules[element.displayOrder] = element;
      formattedRule.isGroup = true;
      this.differentiaRules(element);
    });

    rule.queryRule!.forEach((element) => {
      formattedRule.rules[element.displayOrder] = element;
    });

  }

  editSearch(node: TreeNode<any, TreeData>, data: TreeData) {

    this.editSearchId = data.id;

    ApiService.post(
      'search/load', { queryId: this.editSearchId },
    )
      .then((rule: QueryGroup2) => {

        this.differentiaRules(rule);
        this.rule = rule;
      });
  }

  extractText(htmlString: string) {
    const span = document.createElement('span');
    span.innerHTML = htmlString;

    return span.textContent || span.innerText;
  }

  handleInputConfirm(data: TreeData) {
    if (this.tagInputValue) {
      data.value.push(this.tagInputValue);
    }
    data.tagInputVisible = false;
    this.tagInputValue = '';
    this.saveFieldData(data);
  }

  handleSelectColumnChange(value: any, movedKeys: string[], added: boolean) {

    const movedItem = movedKeys[0];

    const objectToUpdate = {
      columnType: movedItem.split('_')[0],
      columnId: movedItem.split('_')[1]
    };

    if (added) {
      CommonCRUDService.fieldsUpsert('userColumn', objectToUpdate);

      ApiService.post('document/setAndGetSelectedColumnData', {
        selectedColumn: movedItem, paginate: this.documentPaginate
      })
        .then((columnData: any[]) => {

          this.selectedColumns.push({
            // tslint:disable-next-line: max-line-length
            label: findById(movedItem, this.documentField)!.label, // TODO: use updateValue instead. as loop is already going there. return matched object.
            prop: movedItem
          } as TableColumn);

          columnData.forEach((element, index) => {
            this.documents[index][movedItem] = element;
          });

        });

    } else {

      this.selectedColumns = this.selectedColumns.filter((item) =>
        item.prop !== movedItem);

      this.documents.forEach((document) => {
        // tslint:disable-next-line: max-line-length
        delete document[movedItem]; // TODO: This needs to be deleted from serverside temp table as well. similar to when we were adding them.
      });

      ApiService.post('document/deleteSelectedColumnData', { selectedColumn: movedItem })
        .then();

      const queryGroup: QueryGroup = {
        condition: Condition.And,
        isGroup: true,
        rules: [
          {
            fieldName: 'columnId',
            operation: Operation.EqualTo,
            value: objectToUpdate.columnId
          } as QueryRule,
          {
            fieldName: 'columnType',
            operation: Operation.EqualTo,
            value: objectToUpdate.columnType
          } as QueryRule]
      };

      CommonCRUDService.delete('userColumn', queryGroup);
    }
  }

  // TODO: Need to check following typecasting.
  handleSelectionChange(val: any) {
    this.multipleSelection = val;
  }

  HTMLToTextformatter(row: any, column: any) {
    const temp = document.createElement('div');
    temp.innerHTML = row[column.property];

    return temp.textContent;
  }

  lazySaveFieldData(fieldData: TreeData) {
    if (this.lazySaveTimeout) {
      clearTimeout(this.lazySaveTimeout);
    }
    this.lazySaveTimeout = setTimeout(() => { this.saveFieldData(fieldData); }, AppStore.autoSaveTime);
  }

  loadDoc(selectedDocument: { id: number }) {
    this.selectedDocumentId = selectedDocument.id;

    ApiService.post('document/fieldData', { documentId: this.selectedDocumentId })
      .then((responseData: KeyValue[]) => {
        this.documentField.forEach(updateValue(null, 'value', null)); // Reset all
        if (responseData) {
          responseData.forEach((element) => {
            this.documentField.forEach(updateValue(`${NodeType.DocumentField}_${element.key}`, 'value', element.value));
          });
        }
      });
  }

  loadDocuments() {
    ApiService.post(
      'documentSearch/search', { queryRule: this.rule, paginate: this.documentPaginate },
    )
      .then((responseData: any) => {
        this.documentPaginate.total = responseData.paginate.total;
        this.documents = responseData.documents;
      });
  }

  mounted() {
    this.loadDocuments();

    eventBus.$on('SearchesRetrieved', () => {
      this.searchesKey += 1;
    });

    eventBus.$on('DocumentFieldsRetrieved', () => {

      CommonCRUDService.get('userColumn', ['columnType', 'columnId'])
        .then((userColumns: UserColumn[]) => {

          this.selectedColumns = this.selectedColumns.concat(userColumns.map((uc) => {

            const columnId = `${uc.columnType}_${uc.columnId}`;

            this.documentField.forEach(updateValue(columnId, 'selectedColumn', true));
            eventBus.$emit('selectedColumnSet');

            return {
              // tslint:disable-next-line: max-line-length
              label: findById(columnId, this.documentField)!.label, // TODO: use updateValue instead. as loop is already going there. return matched object.
              prop: columnId
            } as TableColumn;

          }));
        });
    });

  }

  // TODO: Need to check parameters of TreeNode which is currently any, any.
  remove(node: TreeNode<any, TreeData>, data: TreeData) {
    const parent = node.parent;
    if (parent !== null) {
      const children = parent.data.children!;
      const index = children.indexOf(data.id);
      children.splice(index, 1);
    }
  }

  saveFieldData(fieldData: TreeData) {
    ApiService.post(
      'document/saveFieldData', {
      documentId: this.selectedDocumentId,
      fieldType: fieldData.fieldType,
      fieldId: fieldData.id.split('_')[1],
      fieldValue: fieldData.value,
      fieldHTMLText: fieldData.fieldType === FieldType.Text ? this.extractText(fieldData.value) : null
    });
  }

  // TODO: Need to check parameters of TreeNode which is currently any.
  saveOrDiscard(node: TreeNode<any, TreeData>, data: TreeData) {
    const parentNode = node.parent!;

    // If empty, discard.
    if (data.label !== null && !data.label!.length) {
      this.remove(node, data);

      return;
    }

    // TODO: Use vuelidate in future.
    if ((data as any).fieldType === null) {
      return;
    }

    data.isAdd = false;

    if (parentNode.data.nodeType === NodeType.DocumentField) {
      // TODO: in following, we also need to save userid. so that user project association can be there.
      ApiService.post('documentField/saveDocumentField', {
        documentField: {
          id: 0,
          name: data.label,
          type: data.fieldType,
          parentId: Number(parentNode.data.id.split('_')[1]) || null,
        },
      },
      )
        .then((documentField: DocumentField) => {
          data.id = documentField.id;
        });
    }

    if (parentNode.data.nodeType === NodeType.Annotation) {
      ApiService.post('documentAnnotation/saveAnnotation', {
        parentId: (parentNode.data.id as string).startsWith('0.') ? null : (parentNode.data.id as string).split('_')[1],
        name: data.label,
      })
        .then((id: number) => {
          data.id = `${NodeType.Annotation}_${id}`;
        });
    }
  }

  @Watch('rule', { deep: true })
  saveQuery() {

    //  TODO: delete this method. will not require.
    return;

  }

  saveSearch(node: TreeNode<any, TreeData>, data: TreeData) {

    const parentNode = node.parent!;
    // TODO: Save Search
    // TODO: convert querybuilderquery to query

    // If empty, discard.
    if (data.label !== null && !data.label!.length) {
      this.remove(node, data);

      return;
    }

    data.isAdd = false;

    // QueryGroup: this.validateAndGetRecursiveQuery(this.rule, true)

    const fieldObject = { name: data.label! } as any;

    if (parentNode.data.id) {
      fieldObject.ParentQueryId = parentNode.data.id;
    }

    CommonCRUDService.fieldsUpsert('Query', fieldObject)
      .then((id: number) => {
        data.id = id;
      });
  }

  search() {
    this.loadDocuments();
  }

  searchValid() {
    this.validateAndGetRecursiveQuery(this.rule, true);
    if (this.validSearch) {
      this.showSaveSearch = true;
    } else {
      this.$message.error('Oops, this is a error message.');
    }
  }

  showInput(data: TreeData) {
    data.tagInputVisible = true;
    this.$nextTick(() => {
      ((this.$refs[`saveTagInput-${data.id}`] as Vue).$refs.input as HTMLElement).focus();
    });
  }

  validateAndGetRecursiveQuery(queryGroup: QueryGroup, isRoot: boolean): QueryGroup2 {

    const resultQueryGroup: QueryGroup2 = {
      id: 0,
      parentQueryGroup: null,
      condition: queryGroup.condition,
      query: null
    } as QueryGroup2;

    queryGroup.rules?.forEach((rule) => {

      // TODO: fix following conversion. it is not correct.
      if ((rule as QueryRule2).operation) {
        const rule2: QueryRule2 = rule as QueryRule2;

        if (rule2.field === null) {
          return;
        }

        this.validSearch = (rule2.field !== null);

        if (rule2.id === null) {
          rule2.id = 0;
        }

        if (!resultQueryGroup.queryRule) {
          resultQueryGroup.queryRule = [];
        }

        resultQueryGroup.queryRule?.push(rule2);
      } else {
        resultQueryGroup.childrenQueryGroup?.push(this.validateAndGetRecursiveQuery(rule as QueryGroup, false));
      }

    });

    return resultQueryGroup;
  }
}
