<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <router-view></router-view>
  </n-config-provider>
</template>

<script lang="ts" setup>
import { GlobalThemeOverrides, NConfigProvider } from 'naive-ui';
import { onMounted } from 'vue';

import { useAppStore } from '@/store/app';

const appStore = useAppStore();
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#ffd700',
    primaryColorHover: '#ffd700',
  },
};

onMounted(() => {
  appStore.version = process.env.VUE_APP_RELEASE_PROJECT_VERSION || '';
});
</script>

<style lang="scss" scoped></style>
