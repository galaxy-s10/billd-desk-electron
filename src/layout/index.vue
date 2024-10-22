<template>
  <div class="layout">
    <div
      v-if="useCustomBar"
      class="top-border no-drag"
      @mousedown="startMove"
      @mouseup="endMove"
      @mousemove="moving"
      @mouseleave="endMove"
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
    <div
      class="container"
      :class="{ mac: !useCustomBar }"
    >
      <RouterView></RouterView>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getRandomString } from 'billd-utils';
import { reactive, ref } from 'vue';

import { IPC_EVENT } from '@/event';
import { useAppStore } from '@/store/app';
import { ipcRendererSend } from '@/utils';

const appStore = useAppStore();

// 窗口当前的位置 + 鼠标当前的相对位置 - 鼠标以前的相对位置
const isMoving = ref<boolean>(false);
const lastPoint = reactive({ x: 0, y: 0 });
const useCustomBar = ref(true);

function handleClose() {
  ipcRendererSend({
    windowId: appStore.windowId,
    channel: IPC_EVENT.closeAllWindow,
    requestId: getRandomString(8),
    data: {},
  });
}

function handleMin() {
  ipcRendererSend({
    windowId: appStore.windowId,
    channel: IPC_EVENT.windowMinimize,
    requestId: getRandomString(8),
    data: {},
  });
}

const startMove = (e: MouseEvent) => {
  isMoving.value = true;
  lastPoint.x = e.clientX;
  lastPoint.y = e.clientY;
};

const endMove = () => {
  isMoving.value = false;
};

const moving = (e: MouseEvent) => {
  if (isMoving.value) {
    ipcRendererSend({
      windowId: appStore.windowId,
      channel: IPC_EVENT.setWindowPosition,
      requestId: getRandomString(8),
      data: {
        x: e.screenX - lastPoint.x,
        y: e.screenY - lastPoint.y,
      },
    });
  }
};
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
    padding: 2px 10px;
    width: 100vw;
    height: 40px;
    border-bottom: 1px solid #e8e4e4;
    background-color: #faf2f2;

    user-select: none;
    -webkit-user-select: none;

    .drag {
      -webkit-app-region: drag;
    }
    .no-drag {
      -webkit-app-region: no-drag;
    }

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
        background-color: #f7564d;
      }
      &.min {
        background-color: #f6c84e;
      }
      &.max {
        background-color: #dedede;
        cursor: auto;
      }
    }
  }
  .container {
    overflow: scroll;
    box-sizing: border-box;
    height: calc(100vh - 40px);

    &.mac {
      height: 100vh;
    }

    @extend %customScrollbarHide;
    &:hover {
      @extend %customScrollbar;
    }
  }
}
</style>
