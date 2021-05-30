import Auth2 from '@/components/auth-2.vue';
import QueryBuilder from '@/components/query-builder/query-builder.vue';
import { Condition } from '@/enums/condition';
import { FieldType } from '@/enums/field-type';
import { OneDriveOperation } from '@/enums/operation';
import { TreeData } from '@/extended-types/tree-data';
import { Datasource } from '~/ecdisco-models/projects/datasource';
import { Datasources, DatasourceType } from '@/models/datasource-type';
import { NodeType } from '@/models/node-type';
import { Project } from '~/ecdisco-models/master/project';
import { QueryGroup, QueryRule } from '@/models/query-builder-query';
import { ApiService } from '@/services/api-service';
import Treeselect from '@riophae/vue-treeselect';
import '@riophae/vue-treeselect/dist/vue-treeselect.css';
import {
  Button,
  Input,
  Option,
  Select,
  Table,
  TableColumn,
  Tree,
} from 'element-ui';
import { TreeNode } from 'element-ui/types/tree';
import { Pane, Splitpanes } from 'splitpanes';
import VueContext from 'vue-context';
import 'vue-context/dist/css/vue-context.css';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';
import uploader from 'vue-simple-uploader';
// tslint:disable-next-line: max-line-length
// TODO: Need to check if following should be used in main as this registers globally. so if someone registers again then what happens.
Vue.use(uploader);

@Component({
  components: {
    Tree,
    ElButton: Button,
    ElInput: Input,
    ElSelect: Select,
    ElTable: Table,
    TableColumn,
    ElOption: Option,
    Pane,
    Splitpanes,
    VueContext,
    Treeselect,
    Auth2,
    QueryBuilder,
  },
})
export default class In extends Vue {
  authDone = false;

  cloudDocuments = [];
  DatasourceType = DatasourceType;
  // TODO: Need to set following in enum and in database

  datasourceTypes = [
    { label: 'HDD', id: DatasourceType.HDD },
    {
      label: 'Cloud',
      id: DatasourceType.Cloud,
      children: [
        {
          label: 'One Drive',
          id: `${DatasourceType.Cloud}_${Datasources.OneDrive}`,
        },
        {
          label: 'Google Drive',
          id: `${DatasourceType.Cloud}_${Datasources.GoogleDrive}`,
        },
        { label: 'Box', id: `${DatasourceType.Cloud}_${Datasources.Box}` },
      ],
    },
    {
      label: 'Social Platform',
      id: DatasourceType.SocialPlatform,
      children: [
        {
          label: 'Facebook',
          id: `${DatasourceType.SocialPlatform}_${Datasources.Facebook}`,
        },
        {
          label: 'Twitter',
          id: `${DatasourceType.SocialPlatform}_${Datasources.Twitter}`,
        },
        {
          label: 'Linkedin',
          id: `${DatasourceType.SocialPlatform}_${Datasources.Linkedin}`,
        },
        {
          label: 'Instagram',
          id: `${DatasourceType.SocialPlatform}_${Datasources.Instagram}`,
        },
        {
          label: 'Youtube',
          id: `${DatasourceType.SocialPlatform}_${Datasources.Youtube}`,
        },
      ],
    },
    {
      label: 'Mail',
      id: DatasourceType.Mail,
      children: [
        { label: 'Gmail', id: `${DatasourceType.Mail}_${Datasources.Gmail}` },
        { label: 'Yahoo', id: `${DatasourceType.Mail}_${Datasources.Yahoo}` },
        {
          label: 'Outlook',
          id: `${DatasourceType.Mail}_${Datasources.Outlook}`,
        },
      ],
    },
    { label: 'FTP', id: DatasourceType.FTP },
  ];
  defaultExpandedTreeNodes: any[] = [];

  documentFilters = [
    { id: 'audio', label: 'Audio' },
    {
      id: 'createdDateTime',
      label: 'Created Date Time',
      fieldType: FieldType.DateTime,
    },
    { id: 'deleted', label: 'Deleted' },
    { id: 'file', label: 'File' },
    { id: 'folder', label: 'Folder' },
    { id: 'image', label: 'Image' },
    {
      id: 'lastModifiedDateTime',
      label: 'Last Modified Date Time',
      fieldType: FieldType.DateTime,
    },
    { id: 'video', label: 'Video' },
  ];

  masterDatasourceId = 0;
  NodeType = NodeType;

  options = {
    //  TODO: Following base url is fixed. Need to move to common.
    target: `${ApiService.apiHost}/api/upload`,
    testChunks: false,
    query: {
      projectId: 0,
      datasourceId: 0,
    },
  };
  project: TreeData[] = [
    {
      id: 0,
      label: 'Projects',
      nodeType: NodeType.Project,
      children: [],
    },
  ];

  rule: QueryGroup = {
    condition: Condition.And,
    rules: [],
  };
  selectedDatasourceType: null | string = '0';
  treeLoaded = false;

  add(node: TreeNode<any, TreeData>, data: TreeData) {
    const newChild = { label: '', children: [], isAdd: true };
    data.children!.push(newChild);
    node.expanded = true;
  }

  edit(data: TreeData) {
    data.isEdit = true;
  }

  getFiles() {
    const filter = encodeURIComponent(
      (this.rule.rules as QueryRule[])
        .map(
          (k: QueryRule) =>
            `${k.fieldId} ${OneDriveOperation[k.operation]} ${new Date(
              k.value,
            ).toISOString()}`,
        )
        .join(Condition[this.rule.condition].toLowerCase()),
    );

    return ApiService.post('Datasource/getFiles', {
      datasourceId: this.options.query.datasourceId,
      filter,
    }).then((fileData) => {
      if (isNaN(fileData)) {
        this.authDone = true;
        this.cloudDocuments = fileData.value;
      } else {
        this.masterDatasourceId = fileData;
        this.authDone = false;
      }
    });
  }

  mounted() {
    ApiService.post('Project/GetProjects').then((projects: Project[]) => {
      this.project[0].children = projects.map((project: Project) => ({
        id: project.id,
        label: project.name,
        isEdit: false,
        children: [
          {
            id: 0,
            label: 'Datasources',
            nodeType: NodeType.Datasource,
            children: project.datasource.map((datasource: Datasource) => ({
              id: datasource.id,
              label: datasource.name,
              datasourceType: `${datasource.type}_${datasource.source}`,
            })),
          },
        ],
      }));

      this.treeLoaded = true;

      if (this.$route.params.datasourceId) {
        setTimeout(() => {
          (this.$refs.projectTree as Tree).setCurrentKey(
            this.$route.params.datasourceId,
          );

          setTimeout(() => {
            this.upload(
              (this.$refs.projectTree as Tree).getNode(
                this.$route.params.datasourceId,
              ),
              (this.$refs.projectTree as Tree).getCurrentNode(),
            );
          });
        });
      }
    });
  }

  @Watch('$route', { immediate: true, deep: true })
  onUrlChange(newVal: Route) {
    if (newVal.params.datasourceId) {
      this.defaultExpandedTreeNodes = [
        0,
        newVal.params.projectId,
        newVal.params.datasourceId,
      ];
    }

    if (this.treeLoaded) {
      // I.e. node click.
      this.upload(
        (this.$refs.projectTree as Tree).getNode(
          this.$route.params.datasourceId,
        ),
        (this.$refs.projectTree as Tree).getCurrentNode(),
      );
    }

    // TODO: Check this state with localstorage. if true then ok. else. need to delete cloud auth.
    // And beofre you check with localstorage. make sure it is being stored to localstorage from oauth2 component.
    const query = { ...this.$route.query };
    if (query.state) {
      delete query.state;
      this.$router.replace({ query });
    }
  }

  // TODO: Need to check parameters of TreeNode which is currently any, any.
  remove(node: TreeNode<any, TreeData>, data: TreeData) {
    const children = node.parent!.data.children!;
    const index = children.indexOf(data.id);
    children.splice(index, 1);

    ApiService.post('Project/deleteProject', { projectId: data.id }).then();
  }

  // TODO: Need to check parameters of TreeNode which is currently any.
  saveOrDiscard(node: TreeNode<any, TreeData>, data: TreeData) {
    const parentNode = node.parent!;

    // If empty, discard.
    if (data.label !== null && !data.label?.length) {
      this.remove(node, data);

      return;
    }

    // TODO: Use vuelidate in future.
    if (
      parentNode.data.nodeType === NodeType.Datasource &&
      (data as any).datasourceType === undefined
    ) {
      return;
    }

    data.isAdd = false;
    data.isEdit = false;

    let query = '';
    let variables: any = {};
    switch (parentNode.data.nodeType) {
      case NodeType.Project:
        data.children = [
          {
            id: 0,
            label: 'Datasources',
            nodeType: NodeType.Datasource,
            children: [],
          },
        ];

        // TODO: in following, we also need to save userid. so that user project association can be there.
        query = 'project/saveProject';
        variables = {
          name: data.label,
        };

        if (data.id) {
          variables.id = data.id;
        }

        break;
      case NodeType.Datasource:
        const dataSourceType = (data as any).datasourceType
          .toString()
          .split('_');

        // TODO: In following we need to pass project id. so that datasource can be associated.
        query = 'datasource/saveDatasource';

        variables = {
          id: null,
          name: data.label,
          type: <DatasourceType>Number(dataSourceType[0]),
          source: Number(dataSourceType[1]),
          project: {
            id: parentNode.parent!.data.id,
          },
        } as Datasource;

        break;
      default:
    }

    // TODO: Define axios graphql base url.
    ApiService.post(query, variables).then((responseData: any) => {
      switch (parentNode.data.nodeType) {
        case NodeType.Project:
          data.id = responseData.project.id;
          break;
        case NodeType.Datasource:
          data.id = responseData.datasource.id;
      }
    });
  }

  upload(node: TreeNode<any, TreeData>, data: TreeData) {
    this.options.query.projectId = node.parent!.parent!.data.id;
    this.options.query.datasourceId = node.data.id;

    if (
      [
        DatasourceType.Cloud.toString(),
        DatasourceType.Mail.toString(),
      ].includes((data as any).datasourceType.split('_')[0])
    ) {
      this.getFiles()
        .then(() => {
          this.selectedDatasourceType = (data as any).datasourceType;
        })
        .catch(() => {
          this.selectedDatasourceType = (data as any).datasourceType;
        });
    } else {
      this.selectedDatasourceType = (data as any).datasourceType;
    }
  }
}
