<template>
  <div>
    <dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="566px"
      top="10px"
      :lock-scroll="true"
      class="full-height-el-dialog"
    >
      <div class="flex-parent flex-column">
        <template v-if="dialogTitle === 'Select Columns'">
          <transfer
            @left-check-change="handleSelectColumnChange"
            filterable
            keepSelectedSourceData
            :treeData="'left'"
            :data="documentField"
            :props="{key: 'id'}"
          ></transfer>
        </template>
      </div>
    </dialog>
    <div class="flex-parent">
      <menu
        default-active="2"
        class="el-menu-vertical-demo"
        :collapse="true"
        :collapse-transition="false"
      >
        <menu-item index="1">
          <i class="el-icon-search" @click="selectedTab = workModules.Results;"></i>
          <span slot="title" @click="selectedTab = workModules.Results;">Results</span>
        </menu-item>
        <menu-item index="2">
          <i class="el-icon-search" @click="selectedTab = workModules.Search;"></i>
          <span slot="title" @click="selectedTab = workModules.Search;">Search</span>
        </menu-item>
      </menu>
      <div class="flex-remaining flex-column" style="width:0;">
        <!-- TODO: Make watch-slot splitpanes component. We can name it like reactive-splitpanes. use it instead of without it as it is causing issue in data update. -->
        <splitpanes v-if="selectedTab == workModules.Search">
          <pane size="30">
            <!-- TODO: This context menu is not able to pickup scopr. In page doesnt require seperate scope. If we can do it better then good otherwise its fine. -->
            <vue-context ref="searchContextMenu">
              <template slot-scope="child">
                <template v-if="child.data">
                  <li>
                    <a
                      type="text"
                      size="mini"
                      @click="() => add(child.data.node, child.data.data)"
                    >Add</a>
                  </li>
                  <li v-if="child.data.data.id !== 0">
                    <a
                      type="text"
                      size="mini"
                      @click="() => remove(child.data.node, child.data.data)"
                    >Delete</a>
                  </li>
                </template>
              </template>
            </vue-context>
            <tree :data="searches" :key="searchesKey" class="fullHeight">
              <span
                class="custom-tree-node"
                slot-scope="{ node, data }"
                @contextmenu.prevent="$refs.searchContextMenu.open($event, { node, data })"
              >
                <el-input
                  v-if="data.isAdd || data.isEdit"
                  placeholder="Please input"
                  v-model.trim="data.label"
                  @blur="() => saveSearch(node, data)"
                ></el-input>
                <span @click="editSearch(node, data)" v-else>{{ node.label }}</span>
              </span>
            </tree>
          </pane>
          <pane size="70">
            <query-builder :filterTreeData="documentField" :rule="rule"></query-builder>
            <toolbar class="flex-remaining flex-column" :justify="'end'">
              <el-button type="primary" @click="() => search()">Search</el-button>
            </toolbar>
          </pane>
        </splitpanes>
        <splitpanes
          v-else-if="selectedTab == workModules.Results"
          watch-slots
          style="height: 100%;"
          class="default-theme"
        >
          <pane size="40">
            <!--TODO: Grid & Paging has design issues. Need to fix. Grid should be of full height. Paging should be completely visible. Grid column default widths need to be determined. -->
            <div class="flex-parent flex-column">
              <el-table
                class="flex-remaining flex-column"
                height="100%"
                highlight-current-row
                @current-change="loadDoc"
                ref="multipleTable"
                :data="documents"
                style="width: 100%"
                @selection-change="handleSelectionChange"
              >
                <table-column type="selection" width="55"></table-column>
                <template v-if="!allowHTML">
                  <table-column
                    v-for="column in selectedColumns"
                    :key="column.label"
                    :prop="column.prop"
                    :label="column.label"
                    :formatter="HTMLToTextformatter"
                  ></table-column>
                </template>
                <template v-else>
                  <table-column
                    v-for="column in selectedColumns"
                    :key="column.label"
                    :prop="column.prop"
                    :label="column.label"
                  >
                    <template slot-scope="scope">
                      <template v-html="scope.row[column.prop]"></template>
                    </template>
                  </table-column>
                </template>
              </el-table>
              <div>
                <div class="flex-parent">
                  <toolbar class="flex-remaining flex-column">
                    <pagination
                      @size-change="loadDocuments"
                      @current-change="loadDocuments"
                      :current-page.sync="documentPaginate.currentPage"
                      :page-sizes="[100, 200, 300, 400]"
                      :page-size.sync="documentPaginate.pageSize"
                      layout="total, sizes, prev, pager, next, jumper"
                      :total="documentPaginate.total"
                    ></pagination>
                  </toolbar>
                  <!-- TODO: Need to check if we can do toolbar in following -->
                  <span class="relative right-margin-10">
                    <i
                      class="material-icons vertical-center right"
                      @click="dialogTitle = 'Select Columns'; dialogVisible = true;"
                    >view_column</i>
                  </span>
                </div>
              </div>
            </div>
          </pane>
          <pane size="35">
            <!-- TODO: Following needs to be disabled when documents are not loaded -->
            <annotator :annotationId="annotationId" :documentId="selectedDocumentId"></annotator>
          </pane>
          <pane size="25">
            <el-form :disabled="!Boolean(selectedDocumentId)">
              <el-form-item>
                <!-- TODO: This context menu is not able to pickup scopr. In page doesnt require seperate scope. If we can do it better then good otherwise its fine. -->
                <vue-context ref="fieldsContextMenu">
                  <template slot-scope="child">
                    <template v-if="child.data">
                      <li>
                        <a
                          type="text"
                          size="mini"
                          @click="() => add(child.data.node, child.data.data)"
                        >Add</a>
                      </li>
                      <template v-if="child.data.data.id !== 0">
                        <li>
                          <!-- TODO: Edit function is not available.-->
                          <a type="text" size="mini" @click="() => edit(child.data.data)">Edit</a>
                        </li>
                        <li>
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
                <!-- TODO: This tree code is duplicaed. need to make common with 'In' Page tree, whatever is possible. -->
                <tree :data="documentField" style="display: inline-block;min-width: 100%;">
                  <!--TODO: default-expanded-keys="[0]" is not working with lazy loading-->
                  <!--TODO: Following Add, Edit & Delete should be icons instead of text and should only be visible on tree node hover-->
                  <span
                    class="custom-tree-node"
                    slot-scope="{ node, data }"
                    @contextmenu.prevent="$refs.fieldsContextMenu.open($event, { node, data })"
                  >
                    <!--TODO: Following is for add. Need to handle edit.-->
                    <template v-if="data.isAdd">
                      <el-input
                        placeholder="Please input"
                        v-model.trim="data.label"
                        @blur="saveOrDiscard(node, data)"
                      ></el-input>
                      <el-select
                        v-if="!data.predefinedType"
                        v-model="data.fieldType"
                        placeholder="Type"
                        @change="saveOrDiscard(node, data)"
                      >
                        <el-option
                          v-for="item in dataTypes"
                          :key="item.id"
                          :label="item.name"
                          :value="item.id"
                        ></el-option>
                      </el-select>
                    </template>
                    <!-- TODO: Following values are not bound yet. Implementation is pending. -->
                    <template v-else-if="data.id !== 0">
                      <checkbox
                        v-if="data.fieldType === fieldType.Checkbox"
                        v-model="data.value"
                        :label="data.label"
                        @change="saveFieldData(data)"
                      ></checkbox>
                      <template v-else-if="data.fieldType === fieldType.Radio">
                        <radio
                          v-if="data.nodeType === nodeType.Annotation"
                          v-model="selectedAnnotationId"
                          :label="data.id"
                        >{{ data.label }}</radio>
                        <radio
                          v-else
                          v-model="data.value"
                          :label="data.id"
                          @change="saveFieldData(data)"
                        >{{ data.label }}</radio>
                      </template>
                      <el-form v-else label-position="top">
                        <el-form-item :label="data.label">
                          <date-picker
                            v-if="data.fieldType == fieldType.DateTime"
                            v-model="data.value"
                            type="datetime"
                            placeholder="Select date and time"
                            @change="saveFieldData(data)"
                          ></date-picker>
                          <el-input-number
                            v-if="data.fieldType === fieldType.Number"
                            v-model="data.value"
                            :min="1"
                            :max="10"
                            @change="saveFieldData(data)"
                          ></el-input-number>
                          <template v-if="data.fieldType === fieldType.Tag">
                            <tag
                              :key="tag"
                              v-for="tag in data.value"
                              closable
                              :disable-transitions="false"
                              @close="saveFieldData(data)"
                            >{{tag}}</tag>
                            <el-input
                              class="input-new-tag"
                              v-if="data.tagInputVisible"
                              v-model="tagInputValue"
                              :ref="`saveTagInput-${data.id}`"
                              size="mini"
                              @keyup.enter.native="handleInputConfirm(data)"
                              @blur="handleInputConfirm(data)"
                            ></el-input>
                            <el-button
                              v-else
                              class="button-new-tag"
                              size="small"
                              @click="showInput(data)"
                            >+ New Tag</el-button>
                          </template>
                          <quill-editor
                            v-if="data.fieldType === fieldType.Text"
                            v-model="data.value"
                            @change="lazySaveFieldData(data)"
                          ></quill-editor>
                        </el-form-item>
                      </el-form>
                    </template>
                    <template v-else>
                      <span>{{ node.label }}</span>
                    </template>
                  </span>
                </tree>
              </el-form-item>
            </el-form>
          </pane>
        </splitpanes>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./work.ts" />

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Open+Sans");
</style>

<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.el-table__body-wrapper {
  flex: 1 1 auto;
}

.el-pagination__total,
.el-pagination__jump {
  color: #606266;
}

.fullHeight {
  height: 100%;
}

.el-tree-node__content {
  height: auto;
}

.el-form--label-top .el-form-item__label {
  padding: initial;
}

.relative {
  position: relative;
}

.vertical-center {
  position: absolute;
  top: 50%;
  transform: translate(-100%, -50%);
}

.right-margin-10 {
  margin-right: 10px;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 240px;
}
</style>
