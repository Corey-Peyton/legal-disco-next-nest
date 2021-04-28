<template>
  <div class="rule-container">
    <template>
      <div class="rule-header">
        <div class="btn-group pull-right rule-actions">
          <el-button
            type="button"
            class="btn btn-xs btn-danger"
            data-delete="rule"
            @click="$emit('deleteRule')"
          >
            <i class="material-icons">remove_circle</i> Delete
          </el-button>
        </div>
      </div>
      <div class="error-container">
        <i class="material-icons">report_problem</i>
      </div>
      <div class="rule-filter-container">
        <!-- TODO: 230px might require common for all. in case of single select at least. -->
        <treeselect
          v-model="ruleField"
          :options="filterTreeData"
          style="width: 230px;"
          @input="saveRule"
        />
      </div>
    </template>
    <template v-if="selectedFilterTreeData">
      <div class="rule-operator-container">
        <el-select
          v-if="selectedFilterTreeData.fieldType !== fieldType.Checkbox && selectedFilterTreeData.fieldType !== fieldType.Radio"
          v-model="rule.operation"
          filterable
          placeholder="Type Or Select"
          @change="saveOperator"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          ></el-option>
        </el-select>
      </div>
      <div class="rule-value-container">
        <!-- TODO: Following is same as document field tree. we can make common partial or full. -->
        <template
          v-if="selectedFilterTreeData.fieldType === fieldType.Checkbox || selectedFilterTreeData.fieldType === fieldType.Radio"
        >
          <switch
            style="display: block"
            v-model="rule.value"
            active-color="#13ce66"
            inactive-color="#ff4949"
            active-text="Yes"
            inactive-text="No"
            @change="saveValue"
          ></switch>
        </template>
        <el-input
          v-if="selectedFilterTreeData.fieldType === fieldType.Text"
          type="textarea"
          :rows="2"
          placeholder="Please input"
          v-model="rule.value"
          @change="saveValue"
        ></el-input>
        <date-picker
          v-if="selectedFilterTreeData.fieldType === fieldType.DateTime"
          v-model="rule.value"
          type="datetime"
          placeholder="Select date and time"
          @change="saveValue"
        ></date-picker>
        <el-input-number
          v-if="selectedFilterTreeData.fieldType === fieldType.Number"
          v-model="rule.value"
          :min="1"
          :max="10"
          @change="saveValue"
        ></el-input-number>
      </div>
    </template>
  </div>
</template>

<script lang="ts" src="./basic-rule.ts"></script>