<template>
  <div class="webrtc-wrap">
    <div
      class="drag"
      :style="style"
      ref="dragEl"
    >
      <span
        class="txt"
        @click="showDetail = !showDetail"
      >
        连接详情
      </span>

      <div
        class="info"
        :class="{ show: showDetail }"
      >
        <n-space>
          <n-button @click="windowReload">刷新页面</n-button>
          <n-button @click="handleDebug">打开调试</n-button>
          <n-button @click="handleTest">测试</n-button>
        </n-space>

        <n-space>
          <n-input-group>
            <n-input-group-label>版本号</n-input-group-label>
            <n-input
              :value="appStore.version"
              disabled
              placeholder=""
            />
          </n-input-group>
          <n-input-group>
            <n-input-group-label>最近更新</n-input-group-label>
            <n-input
              :value="appStore.lastBuildDate"
              disabled
              placeholder=""
            />
          </n-input-group>
        </n-space>
        <n-space>
          <n-input-group>
            <n-input-group-label>wss</n-input-group-label>
            <n-input
              :value="WEBSOCKET_URL"
              disabled
              placeholder=""
            />
          </n-input-group>
          <n-input-group>
            <n-input-group-label>axios</n-input-group-label>
            <n-input
              :value="AXIOS_BASEURL"
              disabled
              placeholder=""
            />
          </n-input-group>
        </n-space>

        <n-space>
          <n-input-group>
            <n-input-group-label>作者微信</n-input-group-label>
            <n-input
              :value="AUTHOR_INFO.wechat"
              disabled
              placeholder=""
            />
            <n-button @click="handleCopy(AUTHOR_INFO.wechat)">复制</n-button>
          </n-input-group>
          <n-input-group>
            <n-input-group-label>作者QQ</n-input-group-label>
            <n-input
              :value="AUTHOR_INFO.qq"
              disabled
              placeholder=""
            />
            <n-button @click="handleCopy(AUTHOR_INFO.qq)">复制</n-button>
          </n-input-group>
        </n-space>
        <n-space>
          <n-input-group>
            <n-input-group-label>github</n-input-group-label>
            <n-input
              :value="PROJECT_GITHUB"
              disabled
              placeholder=""
            />
            <n-button @click="handleOpenExternal(PROJECT_GITHUB)">
              打开
            </n-button>
            <n-button @click="handleCopy(PROJECT_GITHUB)">复制</n-button>
          </n-input-group>
          <n-input-group>
            <n-input-group-label>web端</n-input-group-label>
            <n-input
              @click="handleOpenExternal(WEB_DESK_URL)"
              :value="WEB_DESK_URL"
              disabled
              placeholder=""
            />
            <n-button @click="handleOpenExternal(WEB_DESK_URL)">打开</n-button>
            <n-button @click="handleCopy(WEB_DESK_URL)">复制</n-button>
          </n-input-group>
        </n-space>
        <n-space>
          <n-input-group>
            <n-input-group-label>roomId</n-input-group-label>
            <n-input
              v-model:value="roomId"
              disabled
              placeholder=""
            />
            <n-button @click="handleCopy(roomId)">复制</n-button>
          </n-input-group>
          <n-input-group>
            <n-input-group-label>socketId</n-input-group-label>
            <n-input
              v-model:value="mySocketId"
              placeholder=""
              disabled
            />
            <n-button @click="handleCopy(mySocketId)">复制</n-button>
          </n-input-group>
        </n-space>

        <n-space>
          <n-input-group>
            <n-input-group-label>主控uuid</n-input-group-label>
            <n-input
              v-model:value="deskUserUuid"
              disabled
              placeholder=""
            />
            <n-button @click="handleCopy(deskUserUuid)">复制</n-button>
          </n-input-group>
          <n-input-group>
            <n-input-group-label>主控密码</n-input-group-label>
            <n-input
              v-model:value="deskUserPassword"
              placeholder=""
            />
            <n-button @click="handleCopy(deskUserPassword)">复制</n-button>
          </n-input-group>
        </n-space>

        <n-space>
          <n-input-group>
            <n-input-group-label>被控uuid</n-input-group-label>
            <n-input
              v-model:value="remoteDeskUserUuid"
              disabled
              placeholder=""
            />
            <n-button @click="handleCopy(remoteDeskUserUuid)">复制</n-button>
          </n-input-group>

          <n-input-group>
            <n-input-group-label>被控socketId</n-input-group-label>
            <n-input
              v-model:value="receiverId"
              disabled
              placeholder=""
            />
            <n-button @click="handleCopy(receiverId)">复制</n-button>
          </n-input-group>
        </n-space>

        <n-space>
          <div>模式：</div>
          <n-radio
            :checked="!isWatchMode"
            @change="isWatchMode = !isWatchMode"
          >
            控制模式
          </n-radio>
          <n-radio
            :checked="isWatchMode"
            @change="isWatchMode = !isWatchMode"
          >
            观看模式
          </n-radio>
        </n-space>

        <n-space>
          <div>鼠标：</div>
          <n-radio
            :checked="showCursor"
            @change="showCursor = !showCursor"
          >
            显示
          </n-radio>
          <n-radio
            :checked="!showCursor"
            @change="showCursor = !showCursor"
          >
            隐藏
          </n-radio>
        </n-space>

        <n-space>
          <n-input-group>
            <n-input-group-label>分辨率</n-input-group-label>
            <n-input
              :value="videoSettings?.width + 'x' + videoSettings?.height"
              disabled
              placeholder=""
            />
          </n-input-group>
          <n-input-group>
            <n-input-group-label>帧率</n-input-group-label>
            <n-input
              :value="videoSettings?.frameRate?.toFixed(2)"
              disabled
              placeholder=""
            />
          </n-input-group>
        </n-space>

        <n-space>
          <n-input-group>
            <n-input-group-label>延迟</n-input-group-label>
            <n-input
              :value="rtcRtt"
              disabled
              placeholder=""
            />
          </n-input-group>
          <n-input-group>
            <n-input-group-label>丢包</n-input-group-label>
            <n-input
              :value="rtcLoss"
              disabled
              placeholder=""
            />
          </n-input-group>
        </n-space>

        <n-space>
          <n-input-group>
            <n-input-group-label>码率</n-input-group-label>
            <n-select
              class="down"
              v-model:value="currentMaxBitrate"
              :options="maxBitrate"
            />
          </n-input-group>
          <n-input-group>
            <n-input-group-label>帧率</n-input-group-label>
            <n-select
              class="down"
              v-model:value="currentMaxFramerate"
              :options="maxFramerate"
            />
          </n-input-group>
          <n-input-group>
            <n-input-group-label>分辨率</n-input-group-label>
            <n-select
              class="down"
              v-model:value="currentResolutionRatio"
              :options="resolutionRatio"
            />
          </n-input-group>
        </n-space>
        <n-space>
          <n-input-group>
            <n-input-group-label>视频内容</n-input-group-label>
            <n-select
              class="down"
              v-model:value="currentVideoContentHint"
              :options="videoContentHint"
            />
          </n-input-group>
          <n-input-group>
            <n-input-group-label>音频内容</n-input-group-label>
            <n-select
              class="down"
              v-model:value="currentAudioContentHint"
              :options="audioContentHint"
            />
          </n-input-group>
        </n-space>
      </div>
    </div>

    <div
      class="remote-video"
      ref="videoWrapRef"
      :class="{ 'hide-cursor': !showCursor, watch: isWatchMode }"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @dblclick="handleDoublelclick"
      @contextmenu="handleContextmenu"
    ></div>

    <div
      class="loading"
      v-if="loading"
    >
      正在连接...
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Key } from '@nut-tree-fork/shared';
import { useDraggable } from '@vueuse/core';
import {
  computeBox,
  copyToClipBoard,
  getRandomString,
  windowReload,
} from 'billd-utils';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  AUTHOR_INFO,
  AXIOS_BASEURL,
  PROJECT_GITHUB,
  WEB_DESK_URL,
  WEBSOCKET_URL,
} from '@/constant';
import { IPC_EVENT } from '@/event';
import { useRTCParams } from '@/hooks/use-rtcParams';
import { useTip } from '@/hooks/use-tip';
import { useWebsocket } from '@/hooks/use-websocket';
import { useAppStore } from '@/store/app';
import { useNetworkStore } from '@/store/network';
import {
  BilldDeskBehaviorEnum,
  WsBilldDeskBehaviorType,
  WsBilldDeskStartRemote,
  WsBilldDeskStartRemoteResult,
  WsChangeAudioContentHintType,
  WsChangeMaxBitrateType,
  WsChangeMaxFramerateType,
  WsChangeResolutionRatioType,
  WsChangeVideoContentHintType,
  WsConnectStatusEnum,
  WsMsgTypeEnum,
} from '@/types/websocket';
import { ipcRendererSend, videoFullBox } from '@/utils';

const route = useRoute();
const {
  initWs,
  remoteDeskUserUuid,
  remoteDeskUserPassword,
  deskUserUuid,
  deskUserPassword,
  connectStatus,
} = useWebsocket();
const appStore = useAppStore();
const networkStore = useNetworkStore();

const titlebarHeight = ref(50);

const {
  maxBitrate,
  maxFramerate,
  resolutionRatio,
  audioContentHint,
  videoContentHint,
} = useRTCParams();

const loading = ref(true);
const isWatchMode = ref(false);
const showCursor = ref(true);
const receiverId = ref('');
const loopBilldDeskUpdateUserTimer = ref();
const showDetail = ref(true);
const dragEl = ref<HTMLDivElement>();
const { style } = useDraggable(dragEl, {
  initialValue: { x: 40, y: 40 },
});
const currentMaxBitrate = ref(maxBitrate.value[3].value);
const currentMaxFramerate = ref(maxFramerate.value[4].value);
const currentResolutionRatio = ref(resolutionRatio.value[3].value);
const currentVideoContentHint = ref(videoContentHint.value[3].value);
const currentAudioContentHint = ref(audioContentHint.value[0].value);

let clickTimer: any;
let isLongClick = false;
const videoWrapRef = ref<HTMLVideoElement>();
const windowId = ref('');
const roomId = ref('');
const anchorStream = ref<MediaStream>();
const ioFlag = ref(false);
const videoMap = ref(new Map());
// const chromeMediaSourceId = ref();
const mySocketId = computed(() => {
  return networkStore.wsMap.get(roomId.value)?.socketIo?.id || '';
});

const ipcRenderer = window.electronAPI.ipcRenderer;

const rtcRtt = computed(() => {
  const arr: string[] = [];
  networkStore.rtcMap.forEach((rtc) => {
    arr.push(`${rtc.rtt}ms`);
  });
  return arr.join();
});

const rtcLoss = computed(() => {
  const arr: string[] = [];
  networkStore.rtcMap.forEach((rtc) => {
    arr.push(`${Number(rtc.loss.toFixed(2))}%`);
  });
  return arr.join();
});

const loopGetSettingsTimer = ref();
const loopReconnectTimer = ref();
const videoSettings = ref<MediaTrackSettings>();

watch(
  () => connectStatus.value,
  (newval) => {
    console.log('connectStatus', newval);
    if (newval === WsConnectStatusEnum.connect) {
      clearInterval(loopReconnectTimer.value);
      handleWsMsg();
    } else if (newval === WsConnectStatusEnum.disconnect) {
      window.$message.warning('disconnect');
    }
  },
  { immediate: true }
);

watch(
  () => currentMaxBitrate.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeMaxBitrateType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeMaxBitrate,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);
watch(
  () => currentMaxFramerate.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeMaxFramerateType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeMaxFramerate,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);
watch(
  () => currentResolutionRatio.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeResolutionRatioType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeResolutionRatio,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);
watch(
  () => currentVideoContentHint.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeVideoContentHintType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeVideoContentHint,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);
watch(
  () => currentAudioContentHint.value,
  (newval) => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsChangeAudioContentHintType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.changeAudioContentHint,
        data: {
          live_room_id: Number(roomId.value),
          val: newval,
        },
      });
  }
);

onUnmounted(() => {
  clearInterval(loopBilldDeskUpdateUserTimer.value);
  videoWrapRef.value?.removeEventListener('wheel', handleMouseWheel);
  window.removeEventListener('keydown', handleKeyDown);
  networkStore.removeAllWsAndRtc();
  handleClose();
});

function handleLoopBilldDeskUpdateUserTimer() {
  clearInterval(loopBilldDeskUpdateUserTimer.value);
  loopBilldDeskUpdateUserTimer.value = setInterval(() => {
    networkStore.wsMap.get(roomId.value)?.send<WsBilldDeskStartRemote['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskUpdateUser,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: '',
        maxBitrate: currentMaxBitrate.value,
        maxFramerate: currentMaxFramerate.value,
        resolutionRatio: currentResolutionRatio.value,
        videoContentHint: currentVideoContentHint.value,
        audioContentHint: currentAudioContentHint.value,
        deskUserUuid: deskUserUuid.value,
        deskUserPassword: deskUserPassword.value,
        remoteDeskUserUuid: remoteDeskUserUuid.value,
        remoteDeskUserPassword: remoteDeskUserPassword.value,
      },
    });
  }, 1000 * 2);
}

function handleWsMsg() {
  const ws = networkStore.wsMap.get(roomId.value);
  // 收到billdDeskStartRemoteResult
  ws?.socketIo?.on(
    WsMsgTypeEnum.billdDeskStartRemoteResult,
    (data: WsBilldDeskStartRemoteResult['data']) => {
      console.log('收到billdDeskStartRemoteResult', data);
      if (data.code !== 0) {
        useTip({
          content: data.msg,
          hiddenCancel: true,
          hiddenClose: true,
        });
      } else {
        if (data.data) {
          receiverId.value = data.data.receiver;
          appStore.remoteDesk.set(data.data.receiver, {
            audioContentHint: data.data.audioContentHint,
            videoContentHint: data.data.videoContentHint,
            sender: data.data.sender,
            isClose: false,
            maxBitrate: data.data.maxBitrate,
            maxFramerate: data.data.maxFramerate,
            resolutionRatio: data.data.resolutionRatio,
          });
        }
      }
    }
  );
  ws?.send<WsBilldDeskStartRemote['data']>({
    requestId: getRandomString(8),
    msgType: WsMsgTypeEnum.billdDeskStartRemote,
    data: {
      roomId: roomId.value,
      sender: mySocketId.value,
      receiver: '',
      maxBitrate: currentMaxBitrate.value,
      maxFramerate: currentMaxFramerate.value,
      resolutionRatio: currentResolutionRatio.value,
      videoContentHint: currentVideoContentHint.value,
      audioContentHint: currentAudioContentHint.value,
      deskUserUuid: deskUserUuid.value,
      deskUserPassword: deskUserPassword.value,
      remoteDeskUserUuid: remoteDeskUserUuid.value,
      remoteDeskUserPassword: remoteDeskUserPassword.value,
    },
  });
}

onMounted(() => {
  console.log(route.query);
  if (route.query['roomId'] !== undefined) {
    // @ts-ignore
    roomId.value = route.query['roomId'];
  }
  if (route.query['maxBitrate'] !== undefined) {
    // @ts-ignore
    currentMaxBitrate.value = route.query['maxBitrate'];
  }
  if (route.query['maxFramerate'] !== undefined) {
    // @ts-ignore
    currentMaxFramerate.value = route.query['maxFramerate'];
  }
  if (route.query['resolutionRatio'] !== undefined) {
    // @ts-ignore
    currentResolutionRatio.value = route.query['resolutionRatio'];
  }
  if (route.query['videoContentHint'] !== undefined) {
    // @ts-ignore
    currentVideoContentHint.value = route.query['videoContentHint'];
  }
  if (route.query['audioContentHint'] !== undefined) {
    // @ts-ignore
    currentAudioContentHint.value = route.query['audioContentHint'];
  }
  if (route.query['deskUserUuid'] !== undefined) {
    // @ts-ignore
    deskUserUuid.value = route.query['deskUserUuid'];
  }
  if (route.query['deskUserPassword'] !== undefined) {
    // @ts-ignore
    deskUserPassword.value = route.query['deskUserPassword'];
  }
  if (route.query.remoteDeskUserUuid !== undefined) {
    remoteDeskUserUuid.value = `${route.query.remoteDeskUserUuid as string}`;
  } else {
    window.$message.error('remoteDeskUserUuid为空');
    return;
  }
  if (route.query.remoteDeskUserPassword !== undefined) {
    remoteDeskUserPassword.value = `${
      route.query.remoteDeskUserPassword as string
    }`;
  } else {
    window.$message.error('remoteDeskUserPassword为空');
    return;
  }
  handleLoopBilldDeskUpdateUserTimer();
  videoWrapRef.value?.addEventListener('wheel', handleMouseWheel);
  window.addEventListener('keydown', handleKeyDown);
  initWs({
    roomId: roomId.value,
    isAnchor: false,
    isRemoteDesk: true,
  });
  loopGetSettings();

  if (route.query.width && route.query.height) {
    appStore.workAreaSize.width = Number(route.query.width);
    appStore.workAreaSize.height = Number(route.query.height);
  }

  if (route.query.windowId !== undefined) {
    windowId.value = `${route.query.windowId as string}`;
  }

  ipcRendererSend({
    channel: IPC_EVENT.getChildWindowTitlebarHeight,
    data: { requestId: getRandomString(8), data: { windowId: windowId.value } },
  });
  handleIpcRenderer();
});

function handleIpcRenderer() {
  ipcRenderer.on(
    IPC_EVENT.response_getChildWindowTitlebarHeight,
    (_event, data) => {
      titlebarHeight.value = data.titlebarHeight;
    }
  );

  ipcRenderer.on(IPC_EVENT.response_closeChildWindow, () => {
    networkStore.removeAllWsAndRtc();
    handleClose();
  });

  ipcRenderer.on(IPC_EVENT.response_getMainWindowId, (_event, data) => {
    windowId.value = `${data.id as string}`;
  });

  ipcRenderer.on(IPC_EVENT.response_createWindow, (_event, data) => {
    ipcRendererSend({
      channel: IPC_EVENT.childWindowInit,
      data: {
        requestId: getRandomString(8),
        data: { id: data.id },
      },
    });
  });

  ipcRenderer.on(IPC_EVENT.response_getMousePosition, (_event, data) => {
    console.log(IPC_EVENT.response_getMousePosition, data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseMove, (_event, data) => {
    console.log(IPC_EVENT.response_mouseMove, data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseDrag, (_event, data) => {
    console.log(IPC_EVENT.response_mouseDrag, data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseSetPosition, (_event, data) => {
    console.log(IPC_EVENT.response_mouseSetPosition, data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseDoubleClick, (_event, data) => {
    console.log(IPC_EVENT.response_mouseDoubleClick, data);
  });

  ipcRenderer.on(IPC_EVENT.response_mousePressButtonLeft, (_event, data) => {
    console.log(IPC_EVENT.response_mousePressButtonLeft, data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseReleaseButtonLeft, (_event, data) => {
    console.log(IPC_EVENT.response_mouseReleaseButtonLeft, data);
  });

  ipcRenderer.on(IPC_EVENT.response_keyboardType, (_event, data) => {
    console.log(IPC_EVENT.response_keyboardType, data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseLeftClick, (_event, data) => {
    console.log(IPC_EVENT.response_mouseLeftClick, data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseRightClick, (_event, data) => {
    console.log(IPC_EVENT.response_mouseRightClick, data);
  });
}

function loopGetSettings() {
  clearInterval(loopGetSettingsTimer.value);
  loopGetSettingsTimer.value = setInterval(() => {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.localStream?.getVideoTracks()
      .forEach((item) => {
        videoSettings.value = item.getSettings();
      });
  }, 1000);
}

// async function handleDesktopStream(chromeMediaSourceId) {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       audio: false,
//       video: {
//         // @ts-ignore
//         mandatory: {
//           chromeMediaSource: 'desktop',
//           chromeMediaSourceId,
//         },
//       },
//     });
//     anchorStream.value = stream;
//     updateWebRtcRemoteDeskConfig({
//       roomId: roomId.value,
//       anchorStream: anchorStream.value,
//     });
//     webRtcRemoteDesk.newWebRtc({
//       // 因为这里是收到offer，而offer是房主发的，所以此时的data.data.sender是房主；data.data.receiver是接收者；
//       // 但是这里的nativeWebRtc的sender，得是自己，不能是data.data.sender，不要混淆
//       sender: mySocketId.value,
//       receiver: receiverId.value,
//       videoEl: videoWrapRef.value!,
//     });
//     webRtcRemoteDesk.sendOffer({
//       sender: mySocketId.value,
//       receiver: receiverId.value,
//     });
//   } catch (err) {
//     console.log(err);
//   }
// }

function handleMouseWheel(e: WheelEvent) {
  if (isWatchMode.value) return;
  e.preventDefault();
  if (e.deltaY > 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.billdDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: BilldDeskBehaviorEnum.scrollDown,
          keyboardtype: 0,
          x: 0,
          y: 0,
          amount: Math.abs(e.deltaY),
        },
      });
  } else if (e.deltaY < 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.billdDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: BilldDeskBehaviorEnum.scrollUp,
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
      ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.billdDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: BilldDeskBehaviorEnum.scrollRight,
          keyboardtype: 0,
          x: 0,
          y: 0,
          amount: Math.abs(e.deltaX),
        },
      });
  } else if (e.deltaX < 0) {
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.billdDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          type: BilldDeskBehaviorEnum.scrollLeft,
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

// function reInit() {
//   const ws = networkStore.wsMap.get(roomId.value);
//   ws?.close();
//   loopReconnectTimer.value = setInterval(async () => {
//     const res = await fetchFindReceiverByUuid(remoteDeskUserUuid.value);
//     console.log('remoteDeskUserUuid', res);
//     networkStore.wsMap.get(roomId.value)?.send<WsBilldDeskStartRemote['data']>({
//       requestId: getRandomString(8),
//       msgType: WsMsgTypeEnum.billdDeskStartRemote,
//       data: {
//         roomId: roomId.value,
//         sender: mySocketId.value,
//         receiver: '',
//         maxBitrate: currentMaxBitrate.value,
//         maxFramerate: currentMaxFramerate.value,
//         resolutionRatio: currentResolutionRatio.value,
//         videoContentHint: currentVideoContentHint.value,
//         audioContentHint: currentAudioContentHint.value,
//         deskUserUuid: deskUserUuid.value,
//         deskUserPassword: deskUserPassword.value,
//         remoteDeskUserUuid: remoteDeskUserUuid.value,
//       },
//     });
//   }, 1000);
// }

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
          data: WsBilldDeskBehaviorType['data'];
        } = JSON.parse(event.data);
        const { data } = jsondata;
        if (setting) {
          const x = (setting.width || 0) * (data.x / 1000);
          const y = (setting.height || 0) * (data.y / 1000);
          if (data.type === BilldDeskBehaviorEnum.setPosition) {
            mouseSetPosition({ x, y });
          } else if (data.type === BilldDeskBehaviorEnum.mouseMove) {
            mouseMove({ x, y });
          } else if (data.type === BilldDeskBehaviorEnum.mouseDrag) {
            mouseDrag({ x, y });
          } else if (data.type === BilldDeskBehaviorEnum.leftClick) {
            mouseLeftClick({ x, y });
          } else if (data.type === BilldDeskBehaviorEnum.rightClick) {
            mouseRightClick({ x, y });
          } else if (data.type === BilldDeskBehaviorEnum.doubleClick) {
            mouseDoubleClick();
          } else if (data.type === BilldDeskBehaviorEnum.pressButtonLeft) {
            mousePressButtonLeft();
          } else if (data.type === BilldDeskBehaviorEnum.releaseButtonLeft) {
            mouseReleaseButtonLeft();
          } else if (data.type === BilldDeskBehaviorEnum.keyboardType) {
            keyboardType({ key: data.keyboardtype });
          }
        }
      };
    }
  }
);

watch(
  () => appStore.remoteDesk.size,
  (newval) => {
    if (!newval) {
      handleClose();
    }
  }
);

watch(
  () => networkStore.rtcMap,
  (newVal) => {
    newVal.forEach((item) => {
      if (videoWrapRef.value) {
        if (videoMap.value.has(item.receiver)) {
          if (item.peerConnection?.iceConnectionState === 'connected') {
            loading.value = false;
          }
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
            ipcRendererSend({
              channel: IPC_EVENT.setChildWindowBounds,
              data: {
                requestId: getRandomString(8),
                data: {
                  windowId: windowId.value,
                  width: Math.ceil(res.width),
                  height: Math.ceil(res.height + titlebarHeight.value),
                },
              },
            });
          }
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

function handleCopy(str) {
  copyToClipBoard(str);
  window.$message.success('复制成功');
}

function handleOpenExternal(url) {
  ipcRendererSend({
    channel: IPC_EVENT.shellOpenExternal,
    data: {
      requestId: getRandomString(8),
      data: { url },
    },
  });
}

function handleKeyDown(e: KeyboardEvent) {
  if (isWatchMode.value) return;
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
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.keyboardType,
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
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.doubleClick,
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
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.rightClick,
        keyboardtype: 0,
        x: 0,
        y: 0,
        amount: 0,
      },
    });
}

function handleMouseDown(event: MouseEvent) {
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
  if (event.button === 2) {
    console.log('handleMouseDown-当前是鼠标右键');
    return;
  }
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        keyboardtype: 0,
        type: BilldDeskBehaviorEnum.pressButtonLeft,
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
  const requestId = getRandomString(8);
  console.log(
    'handleMouseMove',
    requestId,
    x,
    y,
    xInsideElement,
    yInsideElement
  );
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId,
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.mouseMove,
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
  if (event.button === 2) {
    console.log('handleMouseUp-当前是鼠标右键');
    return;
  }
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        keyboardtype: 0,
        type: isLongClick
          ? BilldDeskBehaviorEnum.releaseButtonLeft
          : BilldDeskBehaviorEnum.releaseButtonLeft,
        x,
        y,
        amount: 0,
      },
    });
  isLongClick = false;
}

function mouseSetPosition({ x, y }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseSetPosition,
    data: {
      requestId: getRandomString(8),
      data: { x, y },
    },
  });
}

function mouseMove({ x, y }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseMove,
    data: {
      requestId: getRandomString(8),
      data: { x, y },
    },
  });
}

function mouseDrag({ x, y }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseDrag,
    data: {
      requestId: getRandomString(8),
      data: { x, y },
    },
  });
}

function mouseDoubleClick() {
  ipcRendererSend({
    channel: IPC_EVENT.mouseDoubleClick,
    data: {
      requestId: getRandomString(8),
      data: {},
    },
  });
}

function mousePressButtonLeft() {
  ipcRendererSend({
    channel: IPC_EVENT.mousePressButtonLeft,
    data: {
      requestId: getRandomString(8),
      data: {},
    },
  });
}

function keyboardType({ key }) {
  ipcRendererSend({
    channel: IPC_EVENT.keyboardType,
    data: {
      requestId: getRandomString(8),
      data: { key },
    },
  });
}

function mouseReleaseButtonLeft() {
  ipcRendererSend({
    channel: IPC_EVENT.mouseReleaseButtonLeft,
    data: {
      requestId: getRandomString(8),
      data: {},
    },
  });
}

function mouseLeftClick({ x, y }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseLeftClick,
    data: {
      requestId: getRandomString(8),
      data: { x, y },
    },
  });
}

function mouseRightClick({ x, y }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseRightClick,
    data: {
      requestId: getRandomString(8),
      data: { x, y },
    },
  });
}

function handleDebug() {
  ipcRendererSend({
    channel: IPC_EVENT.handleOpenDevTools,
    data: {
      requestId: getRandomString(8),
      data: { windowId: windowId.value },
    },
  });
}

function handleTest() {
  // mouseMove({ x: 690, y: 478 });
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        keyboardtype: 0,
        type: BilldDeskBehaviorEnum.mouseMove,
        x: 690,
        y: 478,
        amount: 0,
      },
    });
  setTimeout(() => {
    // mousePressButtonLeft();
    networkStore.rtcMap
      .get(receiverId.value)
      ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
        requestId: getRandomString(8),
        msgType: WsMsgTypeEnum.billdDeskBehavior,
        data: {
          roomId: roomId.value,
          sender: mySocketId.value,
          receiver: receiverId.value,
          keyboardtype: 0,
          type: BilldDeskBehaviorEnum.pressButtonLeft,
          x: 690,
          y: 478,
          amount: 0,
        },
      });
  }, 50);
  setTimeout(() => {
    const num = 30;
    for (let i = 0; i < num; i += 1) {
      // mouseMove({ x: 690 + i, y: 478 });
      setTimeout(() => {
        networkStore.rtcMap
          .get(receiverId.value)
          ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
            requestId: getRandomString(8),
            msgType: WsMsgTypeEnum.billdDeskBehavior,
            data: {
              roomId: roomId.value,
              sender: mySocketId.value,
              receiver: receiverId.value,
              keyboardtype: 0,
              type: BilldDeskBehaviorEnum.mouseMove,
              x: 690 - i,
              y: 478,
              amount: 0,
            },
          });
      }, 50 * i);
    }
    setTimeout(() => {
      // mouseReleaseButtonLeft();
      networkStore.rtcMap
        .get(receiverId.value)
        ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
          requestId: getRandomString(8),
          msgType: WsMsgTypeEnum.billdDeskBehavior,
          data: {
            roomId: roomId.value,
            sender: mySocketId.value,
            receiver: receiverId.value,
            keyboardtype: 0,
            type: BilldDeskBehaviorEnum.releaseButtonLeft,
            x: 690,
            y: 478,
            amount: 0,
          },
        });
    }, 2000);
  }, 300);
}
</script>

<style lang="scss" scoped>
.webrtc-wrap {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  .drag {
    position: fixed;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: white;
    box-shadow:
      rgba(0, 0, 0, 0.15) 0px 15px 25px,
      rgba(0, 0, 0, 0.05) 0px 5px 10px;
    .txt {
      cursor: pointer;

      user-select: none;
    }
    .info {
      position: absolute;
      top: 100%;
      left: 0;
      display: none;
      box-sizing: border-box;
      padding: 10px;
      width: 800px;
      background-color: white;
      box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
      &.show {
        display: block;
      }
      .down {
        width: 150px;
      }
    }
  }
  .remote-video {
    width: 100vw;
    height: 100vh;
    line-height: 0;
    &.hide-cursor {
      cursor: none;
    }
    &.watch {
      pointer-events: none;
    }
  }
  .loading {
    position: fixed;
    top: 50%;
    left: 50%;
    font-size: 30px;
    transform: translate(-50%, -50%);
  }
}
</style>
