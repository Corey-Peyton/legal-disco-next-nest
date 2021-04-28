<template>
  <div class="el-transfer-panel">
    <p class="el-transfer-panel__header">
      <checkbox
        v-model="allChecked"
        @change="handleAllCheckedChange"
        :indeterminate="isIndeterminate"
      >
        {{ title }}
        <span>{{ checkedSummary }}</span>
      </checkbox>
    </p>

    <div
      class="custom-flex-parent flex-column inherit-height"
      :class="['el-transfer-panel__body', hasFooter ? 'is-with-footer' : '']"
    >
      <el-input
        class="el-transfer-panel__filter"
        v-model="query"
        size="small"
        :placeholder="placeholder"
        @mouseenter.native="inputHover = true"
        @mouseleave.native="inputHover = false"
        v-if="filterable"
      >
        <i slot="prefix" :class="['el-input__icon', 'el-icon-' + inputIcon]" @click="clearQuery"></i>
      </el-input>
      <template v-if="isTreeData">
        <div class="flex-remaining flex-column auto-scroll">
          <tree
            class="filter-tree"
            :data="data"
            default-expand-all
            :check-strictly="true"
            :filter-node-method="filterNode"
            :node-key="keyProp"
            ref="tree"
          >
            <span class="el-tree-node__content" slot-scope="{ node, data }">
              <checkbox
                v-if="data.checkable"
                v-model="data.selectedColumn"
                @change="handleCheckChange"
              ></checkbox>
              <span>{{ node.label }}</span>
            </span>
          </tree>
        </div>
      </template>
      <checkbox-group
        v-else
        v-model="checked"
        v-show="!hasNoMatch && data.length > 0"
        :class="{ 'is-filterable': filterable }"
        class="el-transfer-panel__list"
      >
        <checkbox
          class="el-transfer-panel__item"
          :label="item[keyProp]"
          :disabled="item[disabledProp]"
          :key="item[keyProp]"
          v-for="item in filteredData"
        >
          <option-content :option="item"></option-content>
        </checkbox>
      </checkbox-group>
      <p class="el-transfer-panel__empty" v-show="hasNoMatch">{{ t('el.transfer.noMatch') }}</p>
      <p
        class="el-transfer-panel__empty"
        v-show="data.length === 0 && !hasNoMatch"
      >{{ t('el.transfer.noData') }}</p>
    </div>
    <p class="el-transfer-panel__footer" v-if="hasFooter">
      <slot></slot>
    </p>
  </div>
</template>

<script lang="ts" src="./transfer-panel.ts"/>

<style>
.custom-flex-parent {
  display: flex;
}

.auto-scroll {
  overflow: auto;
}
</style>