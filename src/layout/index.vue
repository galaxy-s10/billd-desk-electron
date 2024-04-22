<template>
  <div class="layout">
    <div
      class="top-border"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <div
        class="ico close"
        @click="handleClose"
      >
        <div class="corss"></div>
      </div>
      <div
        class="ico min"
        @click="handleMin"
      >
        <div class="heng"></div>
      </div>
      <div class="ico max"></div>
    </div>
    <RouterView></RouterView>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import { useNetworkStore } from '@/store/network';

const networkStore = useNetworkStore();
const isDown = ref(false);

const downClientPosition = ref({ clientX: 0, clientY: 0 });

function handleClose() {
  networkStore.removeAllWsAndRtc();
  setTimeout(() => {
    window.electronAPI.ipcRenderer.send('windowClose');
  }, 300);
}

function handleMin() {
  window.electronAPI.ipcRenderer.send('windowMinimize');
}

function handleMouseDown(event: MouseEvent) {
  isDown.value = true;
  downClientPosition.value.clientX = event.clientX;
  downClientPosition.value.clientY = event.clientY;
}

function handleMouseMove(event: MouseEvent) {
  if (!isDown.value) return;
  window.electronAPI.ipcRenderer.send(
    'setWindowPosition',
    event.screenX - downClientPosition.value.clientX,
    event.screenY - downClientPosition.value.clientY
  );
}
function handleMouseUp() {
  isDown.value = false;
}
</script>

<style lang="scss" scoped>
.layout {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  .top-border {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 2px 8px;
    width: 100vw;
    height: 40px;
    border-bottom: 1px solid #e8e4e4;
    background-color: #faf2f2;
    // -webkit-user-select: none;
    // -webkit-app-region: drag;

    -webkit-app-region: no-drag;

    .ico {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      font-size: 12px;
      cursor: pointer;

      -webkit-app-region: no-drag;
      .corss {
        width: 8px;
        height: 8px;

        @include cross(black, 1px);
      }
      .heng {
        width: 7px;
        height: 1px;
        background-color: black;
      }
      &.close {
        background-color: #eb6a5e;
      }
      &.min {
        background-color: #f4bf4f;
      }
      &.max {
        background-color: #dedede;
        cursor: auto;
      }
    }
  }
}
</style>
