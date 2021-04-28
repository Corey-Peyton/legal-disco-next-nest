<template>
  <!-- TODO: Need to make this component with class box with slot of RemainingHeight & Fixed Height as this is useful in many places. -->
  <div class="box">
    <toolbar class="horizontal-center">
      <div class="vertically-center">
        <i class="material-icons">navigate_before</i>
        <span>File Name.doc</span>
        <i class="material-icons">navigate_next</i>
      </div>
    </toolbar>
    <popover
      placement="right-start"
      title="Annotation Properties"
      width="200"
      v-model="propertyPopoverVisible"
      ref="popover"
      trigger="manual"
    >
      <collapse>
        <collapse-item title="Horizontal" name="1">
          <el-form :label-position="'top'">
            <el-form-item label="Alignment">
              <radio-group
                v-model="activeSelectedObject.horizontal"
                @change="activeSelectedObject.horizontalOffset = horizontalOffest();"
              >
                <radio :label="horizontalDirection.Left">Left</radio>
                <radio :label="horizontalDirection.Right">Right</radio>
              </radio-group>
            </el-form-item>
            <el-form-item label="Offset">
              <el-input-number v-model="activeSelectedObject.horizontalOffset" :min="1"></el-input-number>
            </el-form-item>
          </el-form>
        </collapse-item>
        <collapse-item title="Vertical" name="2">
          <el-form :label-position="'top'">
            <el-form-item label="Alignment">
              <radio-group
                v-model="activeSelectedObject.vertical"
                @change="activeSelectedObject.verticalOffset = verticalOffest();"
              >
                <radio :label="verticalDirection.Top">Top</radio>
                <radio :label="verticalDirection.Bottom">Bottom</radio>
              </radio-group>
            </el-form-item>
            <el-form-item label="Offset">
              <el-input-number v-model="activeSelectedObject.verticalOffset" :min="1"></el-input-number>
            </el-form-item>
          </el-form>
        </collapse-item>
        <collapse-item title="Angle" name="3">
          <el-form :label-position="'top'">
            <el-form-item label="Degree">
              <el-input-number v-model="activeSelectedObject.angle" :min="0" :max="360"></el-input-number>
            </el-form-item>
          </el-form>
        </collapse-item>
      </collapse>
      <template v-for="data in objectProperties">
        <checkbox
          v-if="data.type === fieldType.Checkbox"
          v-model="data.value"
          :label="data.label"
          @change="objectPropertyChange(data)"
        ></checkbox>
        <el-form v-else label-position="top">
          <el-form-item :label="data.label">
            <el-input
              v-if="data.type === fieldType.Text"
              placeholder="Please input"
              v-model="data.value"
              @input="objectPropertyChange(data)"
            ></el-input>
            <color-picker
              v-if="data.type === fieldType.Color"
              v-model="data.value"
              @change="objectPropertyChange(data)"
            ></color-picker>
            <el-input-number
              v-if="data.type === fieldType.Number"
              v-model="data.value"
              :min="1"
              @change="objectPropertyChange(data)"
            ></el-input-number>
          </el-form-item>
        </el-form>
      </template>
    </popover>
    <tabs>
      <tab-pane label="Native" name="native">
        <iframe :src="`${ApiService.apiHost}/webview?file=1026_P1_png`" :height="1000" :width="1000"></iframe>
      </tab-pane>
      <tab-pane label="Image" name="image">
        <toolbar class="horizontal-center">
          <div class="vertically-center">
            <dropdown>
              <i class="material-icons">format_shapes</i>
              <dropdown-menu slot="dropdown">
                <dropdown-item>
                  <i class="material-icons" @click="setDrawObject(drawObject.Ellipse)">lens</i>
                </dropdown-item>
                <dropdown-item>
                  <i class="material-icons" @click="setDrawObject(drawObject.Rect)">crop_3_2</i>
                </dropdown-item>
                <dropdown-item>
                  <i class="material-icons" @click="setDrawObject(drawObject.TextBox)">title</i>
                </dropdown-item>
              </dropdown-menu>
            </dropdown>
            <i class="material-icons" @click="rotate(90)">rotate_right</i>
            <i class="material-icons" @click="rotate(-90)">rotate_left</i>
            <i class="material-icons" @click="setZoom(1.1)">zoom_in</i>
            <i class="material-icons" @click="setZoom(1/1.1)">zoom_out</i>
            <i class="material-icons">format_align_justify</i>
          </div>
        </toolbar>
      </tab-pane>
      <tab-pane label="Text" name="text">Text</tab-pane>
    </tabs>
    <!-- TODO: Following div might not require now as those class have been applied to el popover -->
    <div class="container eltable" slot="reference" v-popover:popover>
      <div ref="rootDiv">
        <!-- TODO: This should be based on this element reference. Not id. as there can be multiple ids when used this multiple time. -->
        <drop class="canvas-div" v-for="item in canvasData" @drop="handleDrop">
          <canvas :id="item.id"></canvas>
        </drop>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./annotator.ts"/>

<style>
.container {
  position: relative;
  padding: 10px;
  overflow: auto;
  height: 100%;
}

.eltable {
  flex: 1 1 auto;
  display: flex;
  flex-flow: column;
}

.box {
  display: flex;
  flex-flow: column;
  height: 100%;
}

i {
  cursor: pointer;
}

.horizontal-center {
  text-align: center;
}

.vertically-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.canvas-div {
  margin: 10px 0;
}
</style>


<!-- For Zoom options. https://objectcomputing.com/resources/publications/sett/june-2014-drawing-with-fabricjs -->
<!-- For rotate https://codepen.io/thomastuts/pen/rmBGoq -->