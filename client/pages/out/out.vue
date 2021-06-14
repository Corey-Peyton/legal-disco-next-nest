<template>
  <div class="out">
    <div class="flex-parent">
      <splitpanes watch-slots class="default-theme in">
        <pane size="30">
          <vue-context ref="contextmenu">
            <template slot-scope="child">
              <template v-if="child.data">
                <li>
                  <a
                    type="text"
                    size="mini"
                    @click="() => add(child.data.node, child.data.data)"
                  >Add</a>
                </li>
                <li>
                  <!-- TODO: Node object gives us data property. so No need to pass data. -->
                  <a
                    type="text"
                    size="mini"
                    @click="() => remove(child.data.node, child.data.data)"
                  >Delete</a>
                </li>
                <li v-if="child.data.data.nodeType == nodeType.Production">
                  <!-- TODO: Node object gives us data property. so No need to pass data. -->
                  <a
                    type="text"
                    size="mini"
                    @click="() => runProduction(child.data.node, child.data.data)"
                  >Run</a>
                </li>
              </template>
            </template>
          </vue-context>
          <!-- TODO: Here expand collapse should not work on add, edit & delete -->
          <tree :data="outTree" class="fullHeight">
            <!--TODO: Following Add, Edit & Delete should be icons instead of text and should only be visible on tree node hover-->
            <span
              class="custom-tree-node"
              slot-scope="{ node, data }"
              @contextmenu.prevent="$refs.contextmenu.open($event, { node, data })"
            >
              <!--TODO: Following is for add. Need to handle edit.-->
              <el-input
                v-if="data.isAdd || data.isEdit"
                placeholder="Please input"
                v-model.trim="data.label"
                @blur="() => saveOrDiscard(node, data)"
              ></el-input>
              <span v-else @click="() => edit(data)">{{ node.label }}</span>
            </span>
          </tree>
        </pane>
        <pane size="70">
          <div class="flex-remaining flex-column">
            <container>
              <main v-if="editNodeType == nodeType.MultiPageAnnotation">
                <splitpanes watch-slots style="height: 100%;">
                  <pane size="50">
                    <annotator :documentId="-1" :annotationId="editNodeId"></annotator>
                  </pane>
                  <pane size="50">
                    <div class="flex-parent flex-column">
                      <tree :data="annotationFields" class="fullHeight">
                        <span slot-scope="{ node, data }">
                          <drag
                            :transfer-data="{ id: data.id, label: data.label, fieldType: data.fieldType }"
                          >
                            <span>{{ node.label }}</span>
                          </drag>
                        </span>
                      </tree>
                    </div>
                  </pane>
                </splitpanes>
              </main>
              <main v-else-if="editNodeType == nodeType.Production">
                <tabs>
                  <tab-pane label="Edit & Run">
                    <collapse v-model="activeNames">
                      <collapse-item title="Filter & Order" name="1">
                        <treeselect
                          :options="annotationFilter"
                          style="width: 230px;"
                          :key="searchesKey"
                          v-model="production.queryId"
                          @select="updateProductionField('queryId')"
                        />
                      </collapse-item>
                      <collapse-item title="Annotations" name="2">
                        <el-form>
                          <el-form-item label="Files to include">
                            <checkbox
                              v-model="production.includeNative"
                              @change="updateProductionField('includeNative')"
                            >Native</checkbox>
                            <checkbox
                              v-model="production.includeImage"
                              @change="updateProductionField('includeImage')"
                            >Image</checkbox>
                          </el-form-item>
                          <template v-if="production.includeImage">
                            <el-table
                              :data="production.productionAnnotationFilter"
                              stripe
                              border
                              style="width: 578px;"
                              height="173"
                            >
                              <table-column prop="annotation" label="Annotation" width="275">
                                <treeselect
                                  slot-scope="scope"
                                  :options="annotations"
                                  :key="annotationsKey"
                                  v-model="production.productionAnnotationFilter[scope.$index].annotationId"
                                  @input="updateProductionAnnotationFilterField('annotationId', scope.$index, node)"
                                />
                              </table-column>
                              <table-column prop="filter" label="Filter" width="250">
                                <treeselect
                                  slot-scope="scope"
                                  :options="annotationFilter"
                                  style="width: 230px;"
                                  v-model="production.productionAnnotationFilter[scope.$index].queryId"
                                  @input="updateProductionAnnotationFilterField('queryId', scope.$index, node)"
                                />
                              </table-column>
                              <table-column width="52">
                                <template slot-scope="scope">
                                  <i
                                    class="el-icon-remove"
                                    @click="deleteRow(scope.$index, production.productionAnnotationFilter)"
                                  ></i>
                                </template>
                              </table-column>
                            </el-table>
                            <el-form-item>
                              <link icon="el-icon-plus" @click="addRow()">New Annotation</link>
                            </el-form-item>
                          </template>
                        </el-form>
                      </collapse-item>
                    </collapse>
                  </tab-pane>
                  <tab-pane label="Preview & Download">
                    <splitpanes watch-slots class="default-theme in">
                      <pane size="70">
                        <!-- Following will also have native viewer -->
                        <annotator :documentId="-1" :annotationId="editNodeId"></annotator>
                      </pane>
                      <pane size="30">
                        <tree
                          :data="[]"
                          show-checkbox
                          default-expand-all
                          node-key="id"
                          ref="tree"
                          highlight-current
                        ></tree>
                        <el-button type="primary" @click="downloadProduction">Download</el-button>
                      </pane>
                    </splitpanes>
                  </tab-pane>
                </tabs>
              </main>
            </container>
          </div>
        </pane>
      </splitpanes>
    </div>
  </div>
</template>

<script lang="ts" src="./out.ts"/>

<style>
.el-main {
  height: 100%;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 240px;
}
</style>
