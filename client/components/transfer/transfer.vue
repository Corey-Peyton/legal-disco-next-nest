<template>
  <div class="el-transfer">
    <transfer-panel
      v-bind="$props"
      ref="leftPanel"
      :data="sourceData"
      :title="titles[0] || t('el.transfer.titles.0')"
      :default-checked="leftDefaultChecked"
      :placeholder="filterPlaceholder || t('el.transfer.filterPlaceholder')"
      :isTreeData="treeData === 'left' || treeData === 'both'"
      @checked-change="onSourceCheckedChange"
    >
      <slot name="left-footer"></slot>
    </transfer-panel>
    <div class="el-transfer__buttons"></div>
    <transfer-panel
      v-bind="$props"
      ref="rightPanel"
      :data="targetData"
      :title="titles[1] || t('el.transfer.titles.1')"
      :default-checked="rightDefaultChecked"
      :placeholder="filterPlaceholder || t('el.transfer.filterPlaceholder')"
      :isTreeData="treeData === 'right' || treeData === 'both'"
      @checked-change="onTargetCheckedChange"
    >
      <slot name="right-footer"></slot>
    </transfer-panel>
    <div class="el-transfer__buttons no-right-padding">
      <el-button
        type="primary"
        :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']"
        @click.native="addToLeft"
        :disabled="rightChecked.length === 0"
      >
        <i class="el-icon-arrow-up"></i>
        <span v-if="buttonTexts[0] !== null">{{ buttonTexts[0] }}</span>
      </el-button>
      <el-button
        type="primary"
        :class="['el-transfer__button', hasButtonTexts ? 'is-with-texts' : '']"
        @click.native="addToRight"
        :disabled="rightChecked.length === 0"
      >
        <span v-if="buttonTexts[1] !== null">{{ buttonTexts[1] }}</span>
        <i class="el-icon-arrow-down"></i>
      </el-button>
    </div>
  </div>
</template>

<script lang="ts" src="./transfer.ts" />

<style scoped>
.no-right-padding {
  padding-right: 0;
}
</style>
