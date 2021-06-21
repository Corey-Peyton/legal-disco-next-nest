<template>
  <div id="querybuilder_group_0" class="rules-group-container">
    <div class="rules-group-header">
      <div class="btn-group pull-right group-actions">
        <el-button
          type="button"
          class="btn btn-xs btn-success"
          data-add="rule"
          @click="addRule()"
        >
          <i class="material-icons">add_circle</i> Add rule
        </el-button>
        <el-button
          type="button"
          class="btn btn-xs btn-success"
          data-add="group"
          @click="addGroup()"
        >
          <i class="material-icons">add_box</i> Add group
        </el-button>
        <el-button
          type="button"
          class="btn btn-xs btn-danger"
          data-delete="group"
          @click="$emit('deleteGroup')"
        >
          <i class="material-icons">remove</i> Delete
        </el-button>
      </div>
      <div class="btn-group group-conditions">
        <label
          class="btn btn-xs btn-primary"
          :class="{
            active: rule.condition === condition.And,
            disabled: rule.condition !== condition.And,
          }"
        >
          <input
            type="radio"
            name="querybuilder_group_0_cond"
            :value="condition.And"
            v-model="rule.condition"
          />AND
        </label>
        <label
          class="btn btn-xs btn-primary"
          :class="{
            active: rule.condition === condition.Or,
            disabled: rule.condition !== condition.Or,
          }"
        >
          <input
            type="radio"
            name="querybuilder_group_0_cond"
            :value="condition.Or"
            v-model="rule.condition"
          />OR
        </label>
        <label
          class="btn btn-xs btn-primary"
          :class="{
            active: rule.condition === condition.Not,
            disabled: rule.condition !== condition.Not,
          }"
        >
          <input
            type="radio"
            name="querybuilder_group_0_cond"
            :value="condition.Not"
            v-model="rule.condition"
          />NOT
        </label>
      </div>
      <div class="error-container">
        <i class="material-icons">report_problem</i>
      </div>
    </div>
    <div class="rules-group-body">
      <div class="rules-list">
        <template v-for="(rule, index) in rule.rules">
          <node
            v-if="rule.isGroup"
            :rule="rule"
            :filterTreeData="filterTreeData"
            @deleteGroup="deleteGroup(index)"
            :simple="simple"
          >
            <template v-for="(_, slot) in $slots">
              <template :slot="slot">
                <slot :name="slot"></slot>
              </template>
            </template>
          </node>
          <basic-rule
            v-else
            :rule="rule"
            :filterTreeData="filterTreeData"
            @deleteRule="deleteRule(index)"
            :simple="simple"
          ></basic-rule>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./query-node.ts"></script>

<style>
.material-icons {
  font-size: 12px;
  display: inline-flex;
  vertical-align: text-bottom;
}
</style>
