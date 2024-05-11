<template>
  <div>
    <div>
      <div>
        <!-- <div v-if="NODE_ENV === 'development'"> -->
        <div>version：{{ appStore.version }}</div>
        <div>wss：{{ WEBSOCKET_URL }}</div>
        <div>axios：{{ AXIOS_BASEURL }}</div>
        <div @click="openToTarget(PROJECT_GITHUB)">
          github：<span class="link">{{ PROJECT_GITHUB }}</span>
        </div>
        <div @click="openToTarget(WEB_DESK_URL)">
          web端：<span class="link">{{ WEB_DESK_URL }}</span>
        </div>
      </div>
      <n-input-group>
        <n-input-group-label>窗口id</n-input-group-label>
        <n-input
          v-model:value="windowId"
          :style="{ width: '200px' }"
          disabled
        />
        <n-button @click="handleCopy(windowId)">复制</n-button>
      </n-input-group>
      <n-input-group>
        <n-input-group-label>我的设备</n-input-group-label>
        <n-input
          v-model:value="mySocketId"
          :style="{ width: '200px' }"
          disabled
        />
        <n-button @click="handleCopy(mySocketId)">复制</n-button>
      </n-input-group>

      <n-input-group>
        <n-input-group-label>被控设备</n-input-group-label>
        <n-input
          v-model:value="receiverId"
          :style="{ width: '200px' }"
          placeholder="请输入被控设备"
        />
        <n-button
          v-if="!appStore.remoteDesk.get(receiverId)?.isRemoteing"
          @click="startRemote"
        >
          开始远程
        </n-button>
        <n-button
          type="error"
          @click="handleClose"
          v-else
        >
          结束远程
        </n-button>
      </n-input-group>
    </div>
    <div>
      <n-button @click="windowReload">刷新页面</n-button>
      <n-button @click="handleDebug">打开调试</n-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { copyToClipBoard, openToTarget, windowReload } from 'billd-utils';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  AXIOS_BASEURL,
  PROJECT_GITHUB,
  WEBSOCKET_URL,
  WEB_DESK_URL,
} from '@/constant';
import { closeUseTip, useTip } from '@/hooks/use-tip';
import { useWebsocket } from '@/hooks/use-websocket';
import { useWebRtcRemoteDesk } from '@/hooks/webrtc/remoteDesk';
import { routerName } from '@/router';
import { useAppStore } from '@/store/app';
import { useNetworkStore } from '@/store/network';
import {
  RemoteDeskBehaviorEnum,
  WsMsgTypeEnum,
  WsRemoteDeskBehaviorType,
} from '@/types/websocket';
import {
  createNullVideo,
  handlConstraints,
  setVideoTrackContentHints,
} from '@/utils';

const route = useRoute();
const { initWs } = useWebsocket();
const appStore = useAppStore();
const networkStore = useNetworkStore();

const { updateWebRtcRemoteDeskConfig, webRtcRemoteDesk } =
  useWebRtcRemoteDesk();

const windowId = ref();
const num = '123456';
const roomId = ref(num);
const receiverId = ref('');
const anchorStream = ref<MediaStream>();
const ioFlag = ref(false);
const isControlOther = ref(false);
const chromeMediaSourceId = ref();
const mySocketId = computed(() => {
  return networkStore.wsMap.get(roomId.value)?.socketIo?.id || '-1';
});

onUnmounted(() => {
  networkStore.removeAllWsAndRtc();
  handleClose();
});

onMounted(() => {
  initWs({
    roomId: roomId.value,
    isAnchor: false,
    isRemoteDesk: true,
  });
  console.log(route.query);
  if (route.query.windowId !== undefined) {
    windowId.value = `${route.query.windowId as string}`;
  } else {
    window.electronAPI.ipcRenderer.send('getMainWindowId', {
      type: 'getMainWindowId',
    });
  }

  window.electronAPI.ipcRenderer.on('workAreaSizeRes', (_event, source) => {
    console.log('workAreaSizeRes', source);
    appStore.workAreaSize.width = source.width;
    appStore.workAreaSize.height = source.height;
  });

  window.electronAPI.ipcRenderer.send('workAreaSize');

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
  window.electronAPI.ipcRenderer.on('mouseScrollDownRes', (_event, source) => {
    console.log('mouseScrollDownRes', source);
  });
  window.electronAPI.ipcRenderer.on('mouseScrollUpRes', (_event, source) => {
    console.log('mouseScrollUpRes', source);
  });
  window.electronAPI.ipcRenderer.on('mouseScrollLeftRes', (_event, source) => {
    console.log('mouseScrollLeftRes', source);
  });
  window.electronAPI.ipcRenderer.on('mouseScrollRightRes', (_event, source) => {
    console.log('mouseScrollRightRes', source);
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
    await handlConstraints({
      frameRate: 30,
      height: 1440,
      stream,
    });
    setVideoTrackContentHints(stream, 'detail');
    // setVideoTrackContentHints(stream, 'motion');
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
      videoEl: createNullVideo(),
    });
    webRtcRemoteDesk.sendOffer({
      sender: mySocketId.value,
      receiver: receiverId.value,
    });
  } catch (err) {
    console.log(err);
  }
}

function handleCopy(str) {
  copyToClipBoard(str);
  window.$message.success('复制成功');
}

function startRemote() {
  if (receiverId.value === '') {
    window.$message.warning('请输入控制设备');
    return;
  }
  isControlOther.value = true;
  window.electronAPI.ipcRenderer.send('createWindow', {
    type: 'createWindow',
    data: {
      route: routerName.webrtc,
      query: {
        receiverId: receiverId.value,
        width: appStore.workAreaSize.width,
        height: appStore.workAreaSize.height,
      },
      x: 0,
      y: 0,
      useWorkAreaSize: true,
    },
  });
}

function handleClose() {
  networkStore.removeRtc(receiverId.value);
  ioFlag.value = false;
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
          } else if (data.type === RemoteDeskBehaviorEnum.scrollDown) {
            mouseScrollDown(data.amount);
          } else if (data.type === RemoteDeskBehaviorEnum.scrollUp) {
            mouseScrollUp(data.amount);
          } else if (data.type === RemoteDeskBehaviorEnum.scrollLeft) {
            mouseScrollLeft(data.amount);
          } else if (data.type === RemoteDeskBehaviorEnum.scrollRight) {
            mouseScrollRight(data.amount);
          }
        }
      };
    }
  }
);

watch(
  // () => appStore.remoteDesk.isRemoteing,
  () => appStore.remoteDesk.get(receiverId.value)?.isRemoteing,
  (newval) => {
    if (newval) {
      if (!isControlOther.value) {
        handleMoveScreenRightBottom();
      }
    } else {
      handleClose();
    }
  }
);

watch(
  // () => appStore.remoteDesk.startRemoteDesk,
  () => appStore.remoteDesk.get(receiverId.value),
  (newval) => {
    console.log('newvalll', receiverId.value, newval?.startRemoteDesk);
    if (newval) {
      handleScreen();
    }
  }
);

watch(
  // () => appStore.remoteDesk.sender,
  () => appStore.remoteDesk,
  (newval) => {
    console.log('kddd', newval, newval.size);
    newval.forEach((item) => {
      console.log('dddd', item);
      receiverId.value = item.sender;
    });
  },
  {
    deep: true,
  }
);

watch(
  // () => appStore.remoteDesk.isClose,
  () => appStore.remoteDesk.get(receiverId.value)?.isClose,
  (newval) => {
    if (newval) {
      networkStore.removeRtc(receiverId.value);
      useTip({
        content: '远程连接断开',
        hiddenCancel: true,
        hiddenClose: true,
      }).catch();
    } else {
      closeUseTip();
    }
  }
);

/** 将程序主窗口移动到屏幕右下角 */
function handleMoveScreenRightBottom() {
  window.electronAPI.ipcRenderer.send('handleMoveScreenRightBottom');
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
  window.electronAPI.ipcRenderer.send('handleOpenDevTools');
}
function mouseScrollDown(amount) {
  window.electronAPI.ipcRenderer.send('mouseScrollDown', amount);
}
function mouseScrollUp(amount) {
  window.electronAPI.ipcRenderer.send('mouseScrollUp', amount);
}
function mouseScrollLeft(amount) {
  window.electronAPI.ipcRenderer.send('mouseScrollLeft', amount);
}
function mouseScrollRight(amount) {
  window.electronAPI.ipcRenderer.send('mouseScrollRight', amount);
}
</script>

<style lang="scss" scoped>
.link {
  cursor: pointer;
  color: $theme-color-gold;
}
</style>
