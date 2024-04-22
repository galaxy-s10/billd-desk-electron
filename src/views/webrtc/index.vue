<template>
  <div class="wrap">
    <!-- <div class="test">
      <n-button @click="windowReload">刷新页面</n-button>
      <n-button @click="handleDebug">打开调试</n-button>
    </div> -->
    <template v-if="NODE_ENV === 'development'">
      <!-- <template v-if="NODE_ENV !== 'development'"> -->
      <div>
        <div>
          <div>wss：{{ WEBSOCKET_URL }}</div>
          <div>axios：{{ AXIOS_BASEURL }}</div>
        </div>
        <n-input-group>
          <n-button>窗口id</n-button>
          <n-input
            v-model:value="windowId"
            :style="{ width: '200px' }"
            disabled
          />
          <n-button @click="copyToClipBoard(windowId)">复制</n-button>
        </n-input-group>

        <n-input-group>
          <n-button>我的设备</n-button>
          <n-input
            v-model:value="mySocketId"
            :style="{ width: '200px' }"
            disabled
          />
          <n-button @click="copyToClipBoard(mySocketId)">复制</n-button>
        </n-input-group>

        <n-input-group>
          <n-button>控制设备</n-button>
          <n-input
            v-model:value="receiverId"
            :style="{ width: '200px' }"
            disabled
          />
          <n-button @click="copyToClipBoard(receiverId)">复制</n-button>
        </n-input-group>
        <div>
          <n-button @click="windowReload">刷新页面</n-button>
          <n-button @click="handleDebug">打开调试</n-button>
        </div>
      </div>
    </template>

    <div
      class="remote-video"
      ref="videoWrapRef"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @dblclick="handleDoublelclick"
      @contextmenu="handleContextmenu"
    ></div>
  </div>

  <div
    v-if="showLoading"
    class="loading"
  >
    <div class="txt">loading</div>
  </div>
</template>

<script lang="ts" setup>
import { Key } from '@nut-tree/shared';
import {
  computeBox,
  copyToClipBoard,
  getRandomString,
  windowReload,
} from 'billd-utils';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { AXIOS_BASEURL, NODE_ENV, WEBSOCKET_URL } from '@/constant';
import { closeUseTip, useTip } from '@/hooks/use-tip';
import { useWebsocket } from '@/hooks/use-websocket';
import { useWebRtcRemoteDesk } from '@/hooks/webrtc/remoteDesk';
import { useAppStore } from '@/store/app';
import { useNetworkStore } from '@/store/network';
import {
  RemoteDeskBehaviorEnum,
  WsConnectStatusEnum,
  WsMsgTypeEnum,
  WsRemoteDeskBehaviorType,
  WsStartRemoteDesk,
} from '@/types/websocket';
import { videoFullBox } from '@/utils';

const route = useRoute();
const { initWs, connectStatus } = useWebsocket();
const appStore = useAppStore();
const networkStore = useNetworkStore();
const titlebarHeight = ref(50);

const { updateWebRtcRemoteDeskConfig, webRtcRemoteDesk } =
  useWebRtcRemoteDesk();

const isDown = ref(false);
let clickTimer: any;
let isLongClick = false;
const videoWrapRef = ref<HTMLVideoElement>();
const windowId = ref('');
const num = '123456';
const roomId = ref(num);
const receiverId = ref('');
const anchorStream = ref<MediaStream>();
const ioFlag = ref(false);
const videoMap = ref(new Map());
const showLoading = ref(true);
const chromeMediaSourceId = ref();
const mySocketId = computed(() => {
  return networkStore.wsMap.get(roomId.value)?.socketIo?.id || '-1';
});

watch(
  () => connectStatus.value,
  (newval) => {
    if (newval === WsConnectStatusEnum.connect) {
      networkStore.wsMap.get(roomId.value)?.send<WsStartRemoteDesk['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.startRemoteDesk,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
        },
      });
    }
  }
);

onUnmounted(() => {
  videoWrapRef.value?.removeEventListener('wheel', handleMouseWheel);
  networkStore.removeAllWsAndRtc();
  handleClose();
  window.removeEventListener('keydown', handleKeyDown);
});

onMounted(() => {
  videoWrapRef.value?.addEventListener('wheel', handleMouseWheel);
  window.addEventListener('keydown', handleKeyDown);
  initWs({
    roomId: roomId.value,
    isAnchor: false,
    isRemoteDesk: true,
  });
  console.log(route.query);

  if (route.query.receiverId !== undefined) {
    receiverId.value = `${route.query.receiverId as string}`;
  } else {
    window.$message.error('receiverId为空');
    return;
  }

  if (route.query.width && route.query.height) {
    appStore.workAreaSize.width = Number(route.query.width);
    appStore.workAreaSize.height = Number(route.query.height);
  }

  if (route.query.windowId !== undefined) {
    windowId.value = `${route.query.windowId as string}`;
  } else {
    window.electronAPI.ipcRenderer.send('getMainWindowId', {
      type: 'getMainWindowId',
    });
  }

  window.electronAPI.ipcRenderer.on(
    'getChildWindowTitlebarHeightRes',
    (_event, source) => {
      console.log('getChildWindowTitlebarHeightRes', source);
      titlebarHeight.value = source.titlebarHeight;
    }
  );

  window.electronAPI.ipcRenderer.send(
    'getChildWindowTitlebarHeight',
    windowId.value
  );

  window.electronAPI.ipcRenderer.on('childWindowClose', () => {
    networkStore.removeAllWsAndRtc();
    handleClose();
  });

  window.electronAPI.ipcRenderer.on('getMainWindowIdRes', (_event, source) => {
    console.log('getMainWindowIdRes', source);
    windowId.value = `${source.id as string}`;
  });

  window.electronAPI.ipcRenderer.on('openRemote', (_event, source) => {
    console.log('openRemote', source);
  });

  window.electronAPI.ipcRenderer.on('createWindowRes', (_event, source) => {
    console.log('createWindowRes', source);
    window.electronAPI.ipcRenderer.send('childWindowInit', {
      type: 'childWindowInit',
      data: { id: source.id },
    });
  });
  window.electronAPI.ipcRenderer.on('getMousePositionRes', (_event, source) => {
    console.log('getMousePositionRes', source);
  });
  window.electronAPI.ipcRenderer.on('mouseMoveRes', (_event, source) => {
    console.log('mouseMoveRes', source);
  });
  window.electronAPI.ipcRenderer.on('mouseDragRes', (_event, source) => {
    console.log('mouseDragRes', source);
  });
  window.electronAPI.ipcRenderer.on('mouseSetPositionRes', (_event, source) => {
    console.log('mouseSetPositionRes', source);
  });
  window.electronAPI.ipcRenderer.on('mouseDoubleClickRes', (_event, source) => {
    console.log('mouseDoubleClickRes', source);
  });
  window.electronAPI.ipcRenderer.on(
    'mousePressButtonLeftRes',
    (_event, source) => {
      console.log('mousePressButtonLeftRes', source);
    }
  );
  window.electronAPI.ipcRenderer.on(
    'mouseReleaseButtonLeftRes',
    (_event, source) => {
      console.log('mouseReleaseButtonLeftRes', source);
    }
  );
  window.electronAPI.ipcRenderer.on('keyboardTypeRes', (_event, source) => {
    console.log('keyboardTypeRes', source);
  });
  window.electronAPI.ipcRenderer.on('mouseLeftClickRes', (_event, source) => {
    console.log('mouseLeftClickRes', source);
  });
  window.electronAPI.ipcRenderer.on('mouseRightClickRes', (_event, source) => {
    console.log('mouseRightClickRes', source);
  });
  window.electronAPI.ipcRenderer.on('getScreenStreamRes', (_event, source) => {
    console.log('收到getScreenStreamRes', source);
    if (source.isErr) {
      window.$message.error(source.msg);
      return;
    }
    chromeMediaSourceId.value = source.stream.id;
    handleDesktopStream(source.stream.id);
  });
});

async function handleDesktopStream(chromeMediaSourceId) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        // @ts-ignore
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId,
        },
      },
    });
    anchorStream.value = stream;
    updateWebRtcRemoteDeskConfig({
      roomId: roomId.value,
      anchorStream: anchorStream.value,
    });
    webRtcRemoteDesk.newWebRtc({
      // 因为这里是收到offer，而offer是房主发的，所以此时的data.data.sender是房主；data.data.receiver是接收者；
      // 但是这里的nativeWebRtc的sender，得是自己，不能是data.data.sender，不要混淆
      sender: mySocketId.value,
      receiver: receiverId.value,
      videoEl: videoWrapRef.value!,
    });
    webRtcRemoteDesk.sendOffer({
      sender: mySocketId.value,
      receiver: receiverId.value,
    });
  } catch (err) {
    console.log(err);
  }
}

function handleMouseWheel(e: WheelEvent) {
  // if (!appStore.remoteDesk.isRemoteing) {
  if (!appStore.remoteDesk.get(receiverId.value)?.isRemoteing) {
    return;
  }
  // console.log('handleMouseWheel', e);
  e.preventDefault();
  if (e.deltaY > 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsRemoteDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.remoteDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: RemoteDeskBehaviorEnum.scrollDown,
          keyboardtype: 0,
          x: 0,
          y: 0,
          amount: Math.abs(e.deltaY),
        },
      });
  } else if (e.deltaY < 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsRemoteDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.remoteDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: RemoteDeskBehaviorEnum.scrollUp,
          keyboardtype: 0,
          x: 0,
          y: 0,
          amount: Math.abs(e.deltaY),
        },
      });
  }
  if (e.deltaX > 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsRemoteDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.remoteDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: RemoteDeskBehaviorEnum.scrollRight,
          keyboardtype: 0,
          x: 0,
          y: 0,
          amount: Math.abs(e.deltaX),
        },
      });
  } else if (e.deltaX < 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsRemoteDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.remoteDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: RemoteDeskBehaviorEnum.scrollLeft,
          keyboardtype: 0,
          x: 0,
          y: 0,
          amount: Math.abs(e.deltaX),
        },
      });
  }
}

function handleClose() {
  networkStore.removeRtc(receiverId.value);
}

watch(
  () => networkStore.rtcMap.get(receiverId.value)?.cbDataChannel,
  (newval) => {
    if (newval) {
      if (ioFlag.value) return;
      ioFlag.value = true;
      const setting = anchorStream.value?.getVideoTracks()[0].getSettings();
      newval.onmessage = (event) => {
        const jsondata: {
          msgType: WsMsgTypeEnum;
          requestId: string;
          data: WsRemoteDeskBehaviorType['data'];
        } = JSON.parse(event.data);
        const { data } = jsondata;
        if (setting) {
          const x = (setting.width || 0) * (data.x / 1000);
          const y = (setting.height || 0) * (data.y / 1000);
          if (data.type === RemoteDeskBehaviorEnum.setPosition) {
            mouseSetPosition(x, y);
          } else if (data.type === RemoteDeskBehaviorEnum.mouseMove) {
            mouseMove(x, y);
          } else if (data.type === RemoteDeskBehaviorEnum.mouseDrag) {
            mouseDrag(x, y);
          } else if (data.type === RemoteDeskBehaviorEnum.leftClick) {
            mouseLeftClick(x, y);
          } else if (data.type === RemoteDeskBehaviorEnum.rightClick) {
            mouseRightClick(x, y);
          } else if (data.type === RemoteDeskBehaviorEnum.doubleClick) {
            mouseDoubleClick(x, y);
          } else if (data.type === RemoteDeskBehaviorEnum.pressButtonLeft) {
            mousePressButtonLeft(x, y);
          } else if (data.type === RemoteDeskBehaviorEnum.releaseButtonLeft) {
            mouseReleaseButtonLeft(x, y);
          } else if (data.type === RemoteDeskBehaviorEnum.keyboardType) {
            keyboardType(data.keyboardtype);
          }
        }
      };
    }
  }
);

watch(
  () => appStore.remoteDesk.get(receiverId.value)?.isRemoteing,
  (newval) => {
    if (!newval) {
      handleClose();
    }
  }
);

watch(
  () => appStore.remoteDesk.get(receiverId.value)?.startRemoteDesk,
  (newval) => {
    if (newval) {
      handleScreen();
    }
  }
);

watch(
  () => appStore.remoteDesk.get(receiverId.value)?.isClose,
  (newval) => {
    if (newval) {
      networkStore.removeRtc(receiverId.value);
      useTip({
        content: '远程连接断开',
        hiddenCancel: true,
        hiddenClose: true,
      })
        .catch()
        .then(() => {
          window.electronAPI.ipcRenderer.send(
            'childWindowClose',
            windowId.value
          );
        });
    } else {
      closeUseTip();
    }
  }
);

watch(
  () => networkStore.rtcMap,
  (newVal) => {
    newVal.forEach((item) => {
      if (videoWrapRef.value) {
        if (videoMap.value.has(item.receiver)) {
          return;
        }
        videoMap.value.set(item.receiver, 1);
        item.videoEl.addEventListener('loadedmetadata', () => {
          if (!videoWrapRef.value) return;
          const rect = videoWrapRef.value.getBoundingClientRect();
          const res = computeBox({
            width: item.videoEl.videoWidth,
            height: item.videoEl.videoHeight,
            maxHeight: rect.height,
            minHeight: 0,
            maxWidth: rect.width,
            minWidth: 0,
          });

          videoFullBox({
            wrapSize: {
              width: res.width,
              height: res.height,
            },
            videoEl: item.videoEl,
          });
          if (res.width && res.height) {
            window.electronAPI.ipcRenderer.send(
              'setChildWindowBounds',
              windowId.value,
              res.width,
              res.height + titlebarHeight.value
            );
          }
          showLoading.value = false;
        });
        videoWrapRef.value.appendChild(item.videoEl);
      }
    });
    nextTick(() => {
      if (videoWrapRef.value) {
        if (newVal.size) {
          videoWrapRef.value.style.display = 'inline-block';
        } else {
          videoWrapRef.value.style.removeProperty('display');
        }
      }
    });
  },
  {
    deep: true,
    immediate: true,
  }
);

function handleKeyDown(e: KeyboardEvent) {
  console.log(e.key, e.code);
  const keyMap = {
    Delete: Key.Delete,
    Enter: Key.Enter,
    Space: Key.Space,
    Backspace: Key.Backspace,
    ShiftLeft: Key.LeftShift,
    ShiftRight: Key.RightShift,
    AltLeft: Key.LeftAlt,
    AltRight: Key.RightAlt,
    Tab: Key.Tab,
    Backquote: Key.Quote,
    Backslash: Key.Backslash,
    ArrowUp: Key.Up,
    ArrowDown: Key.Down,
    ArrowLeft: Key.Left,
    ArrowRight: Key.Right,
    CapsLock: Key.CapsLock,
    ControlLeft: Key.LeftControl,
    ControlRight: Key.RightControl,
    MetaLeft: Key.LeftCmd,
    LeftWin: Key.LeftCmd,
    MetaRight: Key.RightCmd,
    RightWin: Key.RightCmd,
    Fn: Key.Fn,
    F1: Key.F1,
    F2: Key.F2,
    F3: Key.F3,
    F4: Key.F4,
    F5: Key.F5,
    F6: Key.F6,
    F7: Key.F7,
    F8: Key.F8,
    F9: Key.F9,
    F10: Key.F10,
    F11: Key.F11,
    F12: Key.F12,
    F13: Key.F13,
    F14: Key.F14,
    F15: Key.F15,
    F16: Key.F16,
    F17: Key.F17,
    F18: Key.F18,
    F19: Key.F19,
    F20: Key.F20,
    F21: Key.F21,
    F22: Key.F22,
    F23: Key.F23,
    F24: Key.F24,
  };

  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsRemoteDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.remoteDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: RemoteDeskBehaviorEnum.keyboardType,
        keyboardtype: keyMap[e.code] || e.key,
        x: 0,
        y: 0,
        amount: 0,
      },
    });
}

function handleDoublelclick() {
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsRemoteDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.remoteDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: RemoteDeskBehaviorEnum.doubleClick,
        keyboardtype: 0,
        x: 0,
        y: 0,
        amount: 0,
      },
    });
}

function handleContextmenu() {
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsRemoteDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.remoteDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: RemoteDeskBehaviorEnum.rightClick,
        keyboardtype: 0,
        x: 0,
        y: 0,
        amount: 0,
      },
    });
}

function handleMouseDown(event: MouseEvent) {
  isDown.value = true;
  clickTimer = setTimeout(function () {
    console.log('长按');
    isLongClick = true;
    clearTimeout(clickTimer);
  }, 300);
  // 获取点击相对于视窗的位置
  const clickX = event.clientX;
  const clickY = event.clientY;

  // 获取目标元素的位置和尺寸信息
  // @ts-ignore
  const rect: DOMRect = event.target.getBoundingClientRect();
  // 计算点击位置相对于元素的坐标
  const xInsideElement = clickX - rect.left;
  const yInsideElement = clickY - rect.top;
  const x = (xInsideElement / rect.width) * 1000;
  const y = (yInsideElement / rect.height) * 1000;
  console.log('handleMouseDown', x, y, xInsideElement, yInsideElement);
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsRemoteDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.remoteDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        keyboardtype: 0,
        type: isLongClick
          ? RemoteDeskBehaviorEnum.pressButtonLeft
          : RemoteDeskBehaviorEnum.pressButtonLeft,
        x,
        y,
        amount: 0,
      },
    });
}

function handleMouseMove(event: MouseEvent) {
  // 获取点击相对于视窗的位置
  const clickX = event.clientX;
  const clickY = event.clientY;

  // 获取目标元素的位置和尺寸信息
  // @ts-ignore
  const rect: DOMRect = event.target.getBoundingClientRect();
  // 计算点击位置相对于元素的坐标
  const xInsideElement = clickX - rect.left;
  const yInsideElement = clickY - rect.top;
  const x = (xInsideElement / rect.width) * 1000;
  const y = (yInsideElement / rect.height) * 1000;
  console.log('handleMouseMove', x, y, xInsideElement, yInsideElement);
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsRemoteDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.remoteDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: RemoteDeskBehaviorEnum.mouseMove,
        keyboardtype: 0,
        x,
        y,
        amount: 0,
      },
    });
}

function handleMouseUp(event: MouseEvent) {
  if (clickTimer) {
    clearTimeout(clickTimer);
  }
  isDown.value = false;
  // 获取点击相对于视窗的位置
  const clickX = event.clientX;
  const clickY = event.clientY;

  // 获取目标元素的位置和尺寸信息
  // @ts-ignore
  const rect: DOMRect = event.target.getBoundingClientRect();
  // 计算点击位置相对于元素的坐标
  const xInsideElement = clickX - rect.left;
  const yInsideElement = clickY - rect.top;
  const x = (xInsideElement / rect.width) * 1000;
  const y = (yInsideElement / rect.height) * 1000;
  console.log('handleMouseUp', x, y, xInsideElement, yInsideElement);
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsRemoteDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.remoteDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        keyboardtype: 0,
        type: isLongClick
          ? RemoteDeskBehaviorEnum.releaseButtonLeft
          : RemoteDeskBehaviorEnum.releaseButtonLeft,
        x,
        y,
        amount: 0,
      },
    });
  isLongClick = false;
}

function handleScreen() {
  window.electronAPI.ipcRenderer.send('getScreenStream');
}

function mouseSetPosition(x, y) {
  window.electronAPI.ipcRenderer.send('mouseSetPosition', x, y);
}
function mouseMove(x, y) {
  window.electronAPI.ipcRenderer.send('mouseMove', x, y);
}
function mouseDrag(x, y) {
  window.electronAPI.ipcRenderer.send('mouseDrag', x, y);
}
function mouseDoubleClick(x, y) {
  window.electronAPI.ipcRenderer.send('mouseDoubleClick', x, y);
}
function mousePressButtonLeft(x, y) {
  window.electronAPI.ipcRenderer.send('mousePressButtonLeft', x, y);
}
function keyboardType(key) {
  window.electronAPI.ipcRenderer.send('keyboardType', key);
}
function mouseReleaseButtonLeft(x, y) {
  window.electronAPI.ipcRenderer.send('mouseReleaseButtonLeft', x, y);
}
function mouseLeftClick(x, y) {
  window.electronAPI.ipcRenderer.send('mouseLeftClick', x, y);
}
function mouseRightClick(x, y) {
  window.electronAPI.ipcRenderer.send('mouseRightClick', x, y);
}
function handleDebug() {
  window.electronAPI.ipcRenderer.send(
    'handleOpenDevTools',
    Number(windowId.value)
  );
}
</script>

<style lang="scss" scoped>
.wrap {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  .test {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    background-color: red;
  }
  .remote-video {
    width: 100vw;
    height: 100vh;
    line-height: 0;
    cursor: none;
  }
}
.loading {
  z-index: 999;
  background-color: #fff !important;

  @extend %maskBg;

  .txt {
    position: absolute;
    top: 50%;
    left: 50%;
    text-align: center;
    font-size: 20px;
    transform: translate(-50%, -50%);
  }
}
</style>
