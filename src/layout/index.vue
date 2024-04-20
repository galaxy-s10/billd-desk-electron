<template>
  <div
    class="layout"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseout="handleMouseUp"
  >
    <div class="top-border">
      <div
        class="ico close"
        @click="handleClose"
      ></div>
      <div class="ico min"></div>
      <div class="ico max"></div>
    </div>
    {{ windowPosition }}
    {{ downClientPosition }}
    <RouterView></RouterView>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const isDown = ref(false);

const windowPosition = ref({ x: 0, y: 0 });
const downClientPosition = ref({ clientX: 0, clientY: 0 });

onMounted(() => {
  window.electronAPI.ipcRenderer.on(
    'getWindowPositionRes',
    (_event, source) => {
      console.log('getWindowPositionRes', source, source.position);
      windowPosition.value = source.position;
    }
  );
});

function handleClose() {
  window.electronAPI.ipcRenderer.send('windowClose');
}

function handleMouseDown(event: MouseEvent) {
  console.log('handleMouseDown');
  downClientPosition.value.clientX = event.clientX;
  downClientPosition.value.clientY = event.clientY;
  isDown.value = true;
  window.electronAPI.ipcRenderer.send('getWindowPosition');
}

function handleMouseMove(event: MouseEvent) {
  if (!isDown.value) return;
  console.log('handleMouseMove', event.clientX);
  const x = downClientPosition.value.clientX - event.clientX;
  const y = downClientPosition.value.clientY - event.clientY;
  downClientPosition.value.clientX = event.clientX;
  downClientPosition.value.clientY = event.clientY;
  windowPosition.value.x -= x;
  windowPosition.value.y -= y;
  window.electronAPI.ipcRenderer.send(
    'setWindowPosition',
    windowPosition.value.x,
    windowPosition.value.y
  );
}
function handleMouseUp() {
  console.log('handleMouseUp');
  isDown.value = false;
}
</script>

<style lang="scss" scoped>
.layout {
  width: 100vw;
  height: 100vh;
  .top-border {
    display: flex;
    align-items: center;
    padding: 2px 8px;
    width: 100vw;
    height: 20px;
    border-bottom: 1px solid #e8e4e4;
    background-color: #faf2f2;
    // -webkit-user-select: none;
    // -webkit-app-region: drag;
    -webkit-app-region: no-drag;

    .ico {
      margin-right: 8px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      cursor: pointer;

      -webkit-app-region: no-drag;
      &.close {
        background-color: #eb6a5e;
      }
      &.min {
        background-color: #f4bf4f;
      }
      &.max {
        background-color: #61c554;
      }
    }
  }
}
</style>
