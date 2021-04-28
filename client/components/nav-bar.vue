<template>
  <el-menu theme="dark" :default-active="activeIndex" class="menu-demo" mode="horizontal">
    <el-menu-item class="app-title">ecdisco</el-menu-item>
    <el-menu-item :index="Menus.in.toString()">
      <router-link :to="{ name: 'in' }">In</router-link>
    </el-menu-item>
    <el-menu-item :index="Menus.work.toString()">
      <router-link :to="{ name: 'work', params: { projectId: AppStore.projectId }}">Work</router-link>
    </el-menu-item>
    <el-menu-item :index="Menus.out.toString()">
      <router-link :to="{ name: 'out', params: { projectId: AppStore.projectId }}">Out</router-link>
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Menu, MenuItem } from 'element-ui';
import { Menus } from '../enums/menus';
import { AppStore } from '../app-store';
// import 'vue-router/types/vue'; // TODO:Temporary comment

@Component({
  components: {
    ElMenu:Menu, ElMenuItem: MenuItem,
  },
})
export default class NavBar extends Vue {
  Menus = Menus;
  activeIndex: string | null = null;
  AppStore = AppStore;

  created() {
    const unwatch = this.$watch(
      () => this.$route,
      (route) => {
        this.activeIndex = this.Menus[
          route?.name?.toLowerCase() as keyof typeof Menus
        ].toString();
        unwatch();
      }
    );
  }
}
</script>

<style>
@font-face {
  font-family: "Galyon-Bold";
  src: url("~@/assets/font/galyon/Galyon-Bold.otf");
}

.app-title {
  font-family: Galyon-Bold;
  font-size: xx-large;
}
</style>
