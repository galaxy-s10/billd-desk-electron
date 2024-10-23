<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <router-view></router-view>
  </n-config-provider>
</template>

<script lang="ts" setup>
import { GlobalThemeOverrides, NConfigProvider } from 'naive-ui';
import { onMounted } from 'vue';

import { APP_BUILD_INFO } from '@/constant';
import { useAppStore } from '@/store/app';

import {
  fetchDeskVersionByVersion,
  fetchDeskVersionCheck,
} from './api/deskVersion';
import { useIpcRendererSend } from './hooks/use-ipcRendererSend';
import { usePiniaCacheStore } from './store/cache';

const appStore = useAppStore();
const cacheStore = usePiniaCacheStore();

const { handlesetAlwaysOnTop } = useIpcRendererSend();
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#ffd700',
    primaryColorHover: '#ffd700',
  },
};

onMounted(() => {
  console.log('当前地址栏', location.href);
  appStore.version = APP_BUILD_INFO.pkgVersion;
  appStore.lastBuildDate = APP_BUILD_INFO.lastBuildDate;
  handlesetAlwaysOnTop({
    windowId: appStore.windowId,
    flag: cacheStore.isAlwaysOnTop,
  });
  getClient();
  handleDeskVersionCheck();
});

async function handleDeskVersionCheck() {
  const res = await fetchDeskVersionCheck(appStore.version);
  if (res.code === 200 && res.data) {
    appStore.updateModalInfo = res.data;
  }
}

async function getClient() {
  const res = await fetchDeskVersionByVersion(appStore.version);
  if (res.code === 200 && res.data) {
    appStore.deskVersionInfo = res.data;
  }
}
</script>

<style lang="scss" scoped></style>

<style lang="scss">
#app {
  user-select: none;
}
</style>
