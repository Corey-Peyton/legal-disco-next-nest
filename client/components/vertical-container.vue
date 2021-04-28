<template>
  <div class="flex-parent flex-column">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class VerticalContainer extends Vue {}
</script>
