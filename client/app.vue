<template>
  <vertical-container id="app">
    <nav-bar v-if="['annotator'].indexOf($route.name) === -1"></nav-bar>
    <router-view class="flex-remaining flex-column fullHeight" />
  </vertical-container>
</template>

<script lang="ts" src="./app.ts">
</script>

<style lang="sass">
$material-icons-font-path: '~material-icons/iconfont/'
@import '~material-icons/iconfont/material-icons.scss'
</style>
