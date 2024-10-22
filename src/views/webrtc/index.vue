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
          <n-button @click="handleOpenDevTools({ windowId })">
            打开调试
          </n-button>
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
            <n-button
              @click="handleOpenExternal({ windowId, url: PROJECT_GITHUB })"
            >
              打开
            </n-button>
            <n-button @click="handleCopy(PROJECT_GITHUB)">复制</n-button>
          </n-input-group>
          <n-input-group>
            <n-input-group-label>web端</n-input-group-label>
            <n-input
              :value="WEB_DESK_URL"
              disabled
              placeholder=""
            />
            <n-button
              @click="handleOpenExternal({ windowId, url: WEB_DESK_URL })"
            >
              打开
            </n-button>
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
          <n-input-group>
            <n-input-group-label>窗口id</n-input-group-label>
            <n-input
              :value="windowId + ''"
              placeholder=""
              disabled
            />
            <n-button @click="handleCopy(windowId)">复制</n-button>
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
  NUT_KEY_MAP,
  PROJECT_GITHUB,
  WEB_DESK_URL,
  WEBSOCKET_URL,
} from '@/constant';
import { IPC_EVENT } from '@/event';
import { useIpcRendererSend } from '@/hooks/use-ipcRendererSend';
import { useRTCParams } from '@/hooks/use-rtcParams';
import { useTip } from '@/hooks/use-tip';
import { useWebsocket } from '@/hooks/use-websocket';
import { IIpcRendererData } from '@/interface';
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
const appStore = useAppStore();
const networkStore = useNetworkStore();

const {
  initWs,
  remoteDeskUserUuid,
  remoteDeskUserPassword,
  deskUserUuid,
  deskUserPassword,
  connectStatus,
} = useWebsocket();

const {
  maxBitrate,
  maxFramerate,
  resolutionRatio,
  audioContentHint,
  videoContentHint,
} = useRTCParams();

const { handleOpenDevTools, handleOpenExternal } = useIpcRendererSend();

const titlebarHeight = ref(50);
const loading = ref(true);
const isWatchMode = ref(false);
const showCursor = ref(true);
const receiverId = ref('');
const loopBilldDeskUpdateUserTimer = ref();
const showDetail = ref(false);
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
const windowId = ref(-1);
const roomId = ref('');
const videoMap = ref(new Map());
const mySocketId = computed(() => {
  return networkStore.wsMap.get(roomId.value)?.socketIo?.id || '';
});

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

const ipcRenderer = window.electronAPI?.ipcRenderer;

onMounted(() => {
  console.log('webrtc页面');
  console.log(route.query);
  if (route.query.deskUserUuid !== undefined) {
    deskUserUuid.value = String(route.query.deskUserUuid);
  } else {
    window.$message.error('deskUserUuid为空');
    return;
  }
  if (route.query.deskUserPassword !== undefined) {
    deskUserPassword.value = String(route.query.deskUserPassword);
  } else {
    window.$message.error('deskUserPassword为空');
    return;
  }
  if (route.query.remoteDeskUserUuid !== undefined) {
    remoteDeskUserUuid.value = String(route.query.remoteDeskUserUuid);
  } else {
    window.$message.error('remoteDeskUserUuid为空');
    return;
  }
  if (route.query.remoteDeskUserPassword !== undefined) {
    remoteDeskUserPassword.value = String(route.query.remoteDeskUserPassword);
  } else {
    window.$message.error('remoteDeskUserPassword为空');
    return;
  }
  if (route.query.roomId !== undefined) {
    roomId.value = String(route.query.roomId);
  }
  if (route.query.maxBitrate !== undefined) {
    currentMaxBitrate.value = Number(route.query.maxBitrate);
  }
  if (route.query.maxFramerate !== undefined) {
    currentMaxFramerate.value = Number(route.query.maxFramerate);
  }
  if (route.query.resolutionRatio !== undefined) {
    currentResolutionRatio.value = Number(route.query.resolutionRatio);
  }
  if (route.query.videoContentHint !== undefined) {
    currentVideoContentHint.value = String(route.query.videoContentHint);
  }
  if (route.query.audioContentHint !== undefined) {
    currentAudioContentHint.value = String(route.query.audioContentHint);
  }
  handleLoopBilldDeskUpdateUserTimer();
  videoWrapRef.value?.addEventListener('wheel', handleMouseWheel);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  initWs({
    roomId: roomId.value,
    isAnchor: false,
    isRemoteDesk: true,
  });
  loopGetSettings();

  ipcRendererSend({
    windowId: windowId.value,
    channel: IPC_EVENT.getWindowId,
    requestId: getRandomString(8),
    data: {},
  });
});

onUnmounted(() => {
  clearInterval(loopBilldDeskUpdateUserTimer.value);
  videoWrapRef.value?.removeEventListener('wheel', handleMouseWheel);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
  networkStore.removeAllWsAndRtc();
  handleClose();
});

ipcRenderer?.on(
  IPC_EVENT.response_getWindowId,
  (_event, data: IIpcRendererData) => {
    console.log('response_getWindowId', data);
    windowId.value = data.data.id;
    handleInitIpcRendererOn();
    handleInitIpcRendererSend();
  }
);

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

function handleInitIpcRendererSend() {
  ipcRendererSend({
    windowId: windowId.value,
    channel: IPC_EVENT.getWindowTitlebarHeight,
    requestId: getRandomString(8),
    data: {},
  });
}

function handleInitIpcRendererOn() {}

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
  networkStore.removeAllWsAndRtc();
}

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
              windowId: windowId.value,
              channel: IPC_EVENT.setWindowBounds,
              requestId: getRandomString(8),
              data: {
                width: Math.ceil(res.width),
                height: Math.ceil(res.height + titlebarHeight.value),
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

function handleKeyDown(e: KeyboardEvent) {
  if (isWatchMode.value) return;
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.keyboardPressKey,
        keyboardtype:
          NUT_KEY_MAP[e.code] || NUT_KEY_MAP[e.key.toUpperCase()] || e.key,
        x: 0,
        y: 0,
        amount: 0,
      },
    });
}

function handleKeyUp(e: KeyboardEvent) {
  if (isWatchMode.value) return;
  networkStore.rtcMap
    .get(receiverId.value)
    ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
      requestId: getRandomString(8),
      msgType: WsMsgTypeEnum.billdDeskBehavior,
      data: {
        roomId: roomId.value,
        sender: mySocketId.value,
        receiver: receiverId.value,
        type: BilldDeskBehaviorEnum.keyboardReleaseKey,
        keyboardtype:
          NUT_KEY_MAP[e.code] || NUT_KEY_MAP[e.key.toUpperCase()] || e.key,
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
