<template>
  <div>
    <!-- TODO: Need to create splitepants components with watch-slotes. Because without this attribute it is not reactive. so reactive needs in all plces.  -->
    <splitpanes watch-slots class="default-theme in">
      <pane size="30">
        <vue-context ref="contextmenu">
          <template slot-scope="child">
            <template v-if="child.data">
              <template v-if="child.data.data.nodeType !== null">
                <li>
                  <a
                    type="text"
                    size="mini"
                    @click="() => add(child.data.node, child.data.data)"
                  >Add</a>
                </li>
              </template>
              <template v-else>
                <li>
                  <!-- TODO: Edit function is not available.-->
                  <a type="text" size="mini" @click="() => edit(child.data.data)">Edit</a>
                </li>
                <li>
                  <!-- TODO: Node object gives us data property. so No need to pass data. -->
                  <a
                    type="text"
                    size="mini"
                    @click="() => remove(child.data.node, child.data.data)"
                  >Delete</a>
                </li>
              </template>
            </template>
          </template>
        </vue-context>
        <!-- TODO: Here expand collapse should not work on add, edit & delete -->
        <tree
          :highlight-current="true"
          ref="projectTree"
          node-key="id"
          :data="project"
          class="fullHeight"
          :default-expanded-keys="defaultExpandedTreeNodes"
        >
          <!--TODO: Following Add, Edit & Delete should be icons instead of text and should only be visible on tree node hover-->
          <span
            class="custom-tree-node"
            slot-scope="{ node, data }"
            @contextmenu.prevent="$refs.contextmenu.open($event, { node, data })"
          >
            <!--TODO: Following is for add. Need to handle edit.-->
            <template v-if="data.isAdd">
              <el-input
                placeholder="Please input"
                v-model.trim="data.label"
                @blur="() => saveOrDiscard(node, data)"
              ></el-input>
              <treeselect
                class="fullWidth"
                v-if="node.parent.data.nodeType == NodeType.Datasource"
                v-model="data.datasourceType"
                placeholder="Type"
                @input="() => saveOrDiscard(node, data)"
                :options="datasourceTypes"
              />
            </template>
            <template v-else>
              <span>
                <template v-if="node.parent.data.nodeType == NodeType.Project">
                  <el-input
                    v-if="data.isEdit"
                    placeholder="Please input"
                    v-model.trim="data.label"
                    @blur="() => saveOrDiscard(node, data)"
                  ></el-input>
                  <router-link
                    v-else
                    class="link"
                    :to="{ name: 'work', params: { projectId: data.id }}"
                  >{{ node.label }}</router-link>
                </template>
                <template v-if="node.parent.data.nodeType === NodeType.Datasource">
                  <router-link
                    :to="{ path: '/in/project/' + node.parent.parent.data.id + '/datasource/' + node.data.id }"
                  >{{ node.label }}</router-link>
                </template>
                <template v-else>{{ node.label }}</template>
              </span>
            </template>
          </span>
        </tree>
      </pane>
      <pane size="70">
        <div class="flex-parent flex-column">
          <query-builder :filterTreeData="documentFilters" :rule="rule" simple></query-builder>
          <el-button @click="getFiles()">Search</el-button>
          <div class="flex-remaining flex-column fullHeight">
            <uploader
              v-if="Number(selectedDatasourceType.split('_')[0]) === DatasourceType.HDD"
              :options="options"
              class="uploader-example"
            >
              <uploader-unsupport></uploader-unsupport>
              <uploader-drop>
                <p>Drop files here to upload or</p>
                <uploader-btn>select files</uploader-btn>
                <uploader-btn :directory="true">select folder</uploader-btn>
              </uploader-drop>
              <uploader-list></uploader-list>
            </uploader>
            <template v-if="[DatasourceType.Cloud.toString(), DatasourceType.Mail.toString()].includes(selectedDatasourceType.split('_')[0])">
              <auth2
                v-if="!authDone"
                :masterDatasourceId="masterDatasourceId"
                :projectId="options.query.projectId"
                :datasourceId="options.query.datasourceId"
              ></auth2>
              <el-table
                v-else
                height="100%"
                highlight-current-row
                ref="multipleTable"
                :data="cloudDocuments"
                style="width: 100%"
              >
                <table-column type="selection" width="55"></table-column>
                <table-column label="Name">
                  <template slot-scope="scope">
                    <i v-if="'folder' in scope.row" class="material-icons">insert_drive_file</i>
                    <i v-else class="material-icons">folder</i>
                    {{ scope.row.name }}
                  </template>
                </table-column>
              </el-table>
            </template>
          </div>
        </div>
      </pane>
    </splitpanes>
  </div>
</template>

<script lang="ts" src="./in.ts"/>

<style lang="scss">
.in {
  height: 100%;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.uploader-example {
  padding: 15px;
  margin: 40px auto 0;
  font-size: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
}

.uploader-example .uploader-btn {
  margin-right: 4px;
}

.uploader-example .uploader-list {
  max-height: 440px;
  overflow: auto;
  overflow-x: hidden;
  overflow-y: auto;
}

.link {
  color: #eee;
}

.fullHeight {
  height: 100%;
}

.el-tree-node > .el-tree-node__children {
  overflow: visible;
}

/*TODO: Need to set context menu black and white*/
</style>