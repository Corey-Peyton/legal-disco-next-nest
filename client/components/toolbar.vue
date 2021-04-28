<template>
  <div>
    <div class="toolbar">
      <div :class="{ end: justify === 'end' }">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';

@Component
export default class Toolbar extends Vue {
  @Prop()
  justify!: string;
}
</script>

<style>
.toolbar {
  padding: 10px;
}

.end {
  float: right;
}
</style>

