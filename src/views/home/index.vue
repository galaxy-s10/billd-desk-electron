<template>
  <div>
    <n-space>
      <n-button @click="windowReload">刷新页面</n-button>
      <n-button @click="handleOpenDevTools({ windowId: appStore.windowId })">
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
          @click="
            handleOpenExternal({
              windowId: appStore.windowId,
              url: PROJECT_GITHUB,
            })
          "
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
          @click="
            handleOpenExternal({
              windowId: appStore.windowId,
              url: WEB_DESK_URL,
            })
          "
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
          v-model:value="cacheStore.deskUserUuid"
          placeholder=""
          disabled
        />
        <n-button @click="handleResetDeskuuid">重置</n-button>
        <n-button @click="handleCopy(cacheStore.deskUserUuid)">复制</n-button>
      </n-input-group>
      <n-input-group>
        <n-input-group-label>主控密码</n-input-group-label>
        <n-input
          v-model:value="cacheStore.deskUserPassword"
          @blur="handleUpdatePassword"
          placeholder=""
        />
        <n-button @click="handleCopy(cacheStore.deskUserPassword)">
          复制
        </n-button>
      </n-input-group>
    </n-space>

    <n-space align="center">
      <n-input-group>
        <n-input-group-label>窗口id</n-input-group-label>
        <n-input
          :value="appStore.windowId + ''"
          placeholder=""
          disabled
        />
        <n-button @click="handleCopy(appStore.windowId)">复制</n-button>
      </n-input-group>
      <n-space>
        <div>主窗口置顶：</div>
        <n-radio
          :checked="isAlwaysOnTop"
          @change="isAlwaysOnTop = !isAlwaysOnTop"
        >
          是
        </n-radio>
        <n-radio
          :checked="!isAlwaysOnTop"
          @change="isAlwaysOnTop = !isAlwaysOnTop"
        >
          否
        </n-radio>
      </n-space>
    </n-space>

    <n-space>
      <n-input-group>
        <n-input-group-label>被控uuid</n-input-group-label>
        <n-input
          v-model:value="cacheStore.remoteDeskUserUuid"
          placeholder=""
        />
        <n-input-group-label>被控密码</n-input-group-label>
        <n-input
          v-model:value="cacheStore.remoteDeskUserPassword"
          placeholder=""
        />
        <n-button
          @click="startRemote"
          type="primary"
        >
          开始远程
        </n-button>
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

    <div v-if="!appStore.remoteDesk.size">等待被控</div>
    <div v-else>
      正在被{{ appStore.remoteDesk.size }}个用户控制
      <n-button
        type="error"
        @click="handleCloseAll"
      >
        断开所有远程
      </n-button>
    </div>
    <div class="list">
      <div
        class="item"
        v-for="(item, key) in appStore.remoteDesk"
        :key="key"
      >
        <span>socketId：{{ item[1].sender }}，</span>
        <span
          class="del"
          @click="handleDel(item[1].sender)"
        >
          断开
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { copyToClipBoard, getRandomString, windowReload } from 'billd-utils';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  fetchDeskUserCreate,
  fetchDeskUserLogin,
  fetchDeskUserUpdateByUuid,
} from '@/api/deskUser';
import {
  AUTHOR_INFO,
  AXIOS_BASEURL,
  PROJECT_GITHUB,
  WEBSOCKET_URL,
  WEB_DESK_URL,
} from '@/constant';
import { IPC_EVENT } from '@/event';
import { useIpcRendererSend } from '@/hooks/use-ipcRendererSend';
import { useRTCParams } from '@/hooks/use-rtcParams';
import { useTip } from '@/hooks/use-tip';
import { useWebsocket } from '@/hooks/use-websocket';
import { useWebRtcRemoteDesk } from '@/hooks/webrtc/remoteDesk';
import { IIpcRendererData } from '@/interface';
import { routerName } from '@/router';
import { useAppStore } from '@/store/app';
import { usePiniaCacheStore } from '@/store/cache';
import { useNetworkStore } from '@/store/network';
import {
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
import {
  createNullVideo,
  handlConstraints,
  ipcRendererSend,
  setAudioTrackContentHints,
  setVideoTrackContentHints,
} from '@/utils';
import { WebRTCClass } from '@/utils/network/webRTC';

const route = useRoute();
const { initWs, connectStatus } = useWebsocket();
const appStore = useAppStore();
const networkStore = useNetworkStore();
const cacheStore = usePiniaCacheStore();

const { updateWebRtcRemoteDeskConfig, webRtcRemoteDesk } =
  useWebRtcRemoteDesk();
const {
  maxBitrate,
  maxFramerate,
  resolutionRatio,
  audioContentHint,
  videoContentHint,
} = useRTCParams();

const {
  mouseMove,
  mousePressButtonLeft,
  mouseReleaseButtonLeft,
  handleOpenDevTools,
  handlesetAlwaysOnTop,
  handleMoveScreenRightBottom,
  handleScreen,
  handleOpenExternal,
  handleRtcBilldDeskBehavior,
} = useIpcRendererSend();

const currentMaxBitrate = ref(maxBitrate.value[3].value);
const currentMaxFramerate = ref(maxFramerate.value[4].value);
const currentResolutionRatio = ref(resolutionRatio.value[3].value);
const currentVideoContentHint = ref(videoContentHint.value[3].value);
const currentAudioContentHint = ref(audioContentHint.value[0].value);
const rtc = ref<WebRTCClass>();
const roomId = ref('');
const receiverId = ref('');
const anchorStream = ref<MediaStream>();
/** 是否控制别人 */
const isControlOther = ref(false);
const isAlwaysOnTop = ref(false);
const chromeMediaSourceId = ref();
const mySocketId = computed(() => {
  return networkStore.wsMap.get(roomId.value)?.socketIo?.id || '';
});

const originalPassword = ref('');
const loopBilldDeskUpdateUserTimer = ref();
const suspend = ref('');
const resume = ref('');
const position = ref({ x: 0, y: 0 });

const ipcRenderer = window.electronAPI?.ipcRenderer;

onUnmounted(() => {
  networkStore.removeAllWsAndRtc();
  handleCloseAll();
  clearInterval(loopBilldDeskUpdateUserTimer.value);
});

onMounted(() => {
  console.log('home页面');
  console.log('route.query', route.query);
  handleInit();
  ipcRendererSend({
    windowId: 0,
    channel: IPC_EVENT.getWindowId,
    requestId: getRandomString(8),
    data: {},
  });
});

ipcRenderer?.on(
  IPC_EVENT.response_getWindowId,
  (_event, data: IIpcRendererData) => {
    console.log('response_getWindowId', data);
    appStore.windowId = data.data.id;
    handleInitIpcRendererOn();
    handleInitIpcRendererSend();
  }
);

watch(
  () => isAlwaysOnTop.value,
  () => {
    handlesetAlwaysOnTop({
      windowId: appStore.windowId,
      flag: isAlwaysOnTop.value,
    });
  },
  { immediate: true }
);

watch(
  () => networkStore.rtcMap,
  (newval) => {
    newval.forEach((item) => {
      if (!item.cbDataChannel) return;
      // const setting = anchorStream.value?.getVideoTracks()[0].getSettings();
      item.cbDataChannel.onmessage = (event) => {
        const jsondata: {
          msgType: WsMsgTypeEnum;
          requestId: string;
          data: any;
        } = JSON.parse(event.data);
        const { msgType } = jsondata;
        if (msgType === WsMsgTypeEnum.changeMaxBitrate) {
          const { data }: { data: WsChangeMaxBitrateType['data'] } = jsondata;
          currentMaxBitrate.value = data.val;
          rtc.value?.setMaxBitrate(data.val);
        } else if (msgType === WsMsgTypeEnum.changeMaxFramerate) {
          const { data }: { data: WsChangeMaxFramerateType['data'] } = jsondata;
          if (anchorStream.value) {
            currentMaxFramerate.value = data.val;
            handlConstraints({
              frameRate: data.val,
              height: currentResolutionRatio.value,
              stream: anchorStream.value,
            });
          }
        } else if (msgType === WsMsgTypeEnum.changeResolutionRatio) {
          const { data }: { data: WsChangeResolutionRatioType['data'] } =
            jsondata;
          if (anchorStream.value) {
            currentResolutionRatio.value = data.val;
            handlConstraints({
              frameRate: currentMaxFramerate.value,
              height: data.val,
              stream: anchorStream.value,
            });
          }
        } else if (msgType === WsMsgTypeEnum.changeVideoContentHint) {
          const { data }: { data: WsChangeVideoContentHintType['data'] } =
            jsondata;
          if (anchorStream.value) {
            currentVideoContentHint.value = data.val;
            // @ts-ignore
            setVideoTrackContentHints(anchorStream.value, data.val);
          }
        } else if (msgType === WsMsgTypeEnum.changeAudioContentHint) {
          const { data }: { data: WsChangeAudioContentHintType['data'] } =
            jsondata;
          if (anchorStream.value) {
            currentAudioContentHint.value = data.val;
            // @ts-ignore
            setAudioTrackContentHints(anchorStream.value, data.val);
          }
        } else if (msgType === WsMsgTypeEnum.billdDeskBehavior) {
          const { data }: { data: WsBilldDeskBehaviorType['data'] } = jsondata;
          handleRtcBilldDeskBehavior(appStore.windowId, data);
        }
      };
    });
  },
  {
    immediate: true,
    deep: true,
  }
);

watch(
  () => anchorStream.value,
  (newval) => {
    if (newval) {
      appStore.remoteDesk.forEach((item) => {
        if (!item.isClose) {
          console.log('handleRTChandleRTC');
          handleRTC(item.sender);
        }
      });
    }
  }
);

watch(
  () => appStore.remoteDesk.size,
  (newval) => {
    if (newval) {
      if (!isControlOther.value) {
        handleMoveScreenRightBottom({ windowId: appStore.windowId });
      }
      if (!anchorStream.value) {
        handleScreen({ windowId: appStore.windowId });
      }
    } else {
      handleCloseAll();
    }
  }
);

watch(
  () => appStore.remoteDesk,
  (newval) => {
    newval.forEach((item) => {
      if (item.isClose) {
        window.$notification.warning({
          content: `${item.sender}远程连接断开`,
          duration: 2000,
        });
        appStore.remoteDesk.delete(item.sender);
        return;
      }
      currentMaxBitrate.value = item.maxBitrate;
      currentMaxFramerate.value = item.maxFramerate;
      currentResolutionRatio.value = item.resolutionRatio;
      currentVideoContentHint.value = item.videoContentHint;
      currentAudioContentHint.value = item.audioContentHint;
    });
  },
  {
    deep: true,
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
        receiver: receiverId.value,
        maxBitrate: currentMaxBitrate.value,
        maxFramerate: currentMaxFramerate.value,
        resolutionRatio: currentResolutionRatio.value,
        videoContentHint: currentVideoContentHint.value,
        audioContentHint: currentAudioContentHint.value,
        deskUserUuid: cacheStore.deskUserUuid,
        deskUserPassword: cacheStore.deskUserPassword,
        remoteDeskUserUuid: cacheStore.remoteDeskUserUuid,
        remoteDeskUserPassword: cacheStore.remoteDeskUserPassword,
      },
    });
  }, 1000 * 2);
}

async function handleInit() {
  await initDeskUser();
  handleLoopBilldDeskUpdateUserTimer();
  initWs({
    roomId: roomId.value,
    isAnchor: false,
    isRemoteDesk: true,
  });
}

function handleInitIpcRendererSend() {
  ipcRendererSend({
    windowId: appStore.windowId,
    channel: IPC_EVENT.workAreaSize,
    requestId: getRandomString(8),
    data: {},
  });

  ipcRendererSend({
    windowId: appStore.windowId,
    channel: IPC_EVENT.getPrimaryDisplaySize,
    requestId: getRandomString(8),
    data: {},
  });

  ipcRendererSend({
    windowId: appStore.windowId,
    channel: IPC_EVENT.scaleFactor,
    requestId: getRandomString(8),
    data: {},
  });
}

function handleInitIpcRendererOn() {
  ipcRenderer?.on(
    IPC_EVENT.response_open_about,
    (_event, data: IIpcRendererData) => {
      console.log('response_open_about', data);
      ipcRendererSend({
        windowId: 0,
        channel: IPC_EVENT.createWindow,
        requestId: getRandomString(8),
        data: {
          width: 550,
          height: 380,
          route: routerName.about,
          query: {},
          useWorkAreaSize: false,
          frame: true,
        },
      });
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_open_version,
    (_event, data: IIpcRendererData) => {
      console.log('response_open_version', data);
      ipcRendererSend({
        windowId: 0,
        channel: IPC_EVENT.createWindow,
        requestId: getRandomString(8),
        data: {
          width: 300,
          height: 300,
          route: routerName.version,
          query: {},
          useWorkAreaSize: false,
          frame: true,
        },
      });
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_globalShortcut,
    (_event, data: IIpcRendererData) => {
      console.log('response_globalShortcut', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_scaleFactor,
    (_event, data: IIpcRendererData) => {
      if (data.data.platform !== 'darwin') {
        appStore.scaleFactor = data.data.scaleFactor;
      }
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_powerMonitorSuspend,
    (_event, data: IIpcRendererData) => {
      console.log('response_powerMonitorSuspend', data);
      suspend.value = `${new Date().toLocaleString()}-powerMonitorSuspend`;
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_powerMonitorResume,
    (_event, data: IIpcRendererData) => {
      console.log('response_powerMonitorResume', data);
      resume.value = `${new Date().toLocaleString()}-powerMonitorResume`;
      handleCloseAll();
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_getWindowPosition,
    (_event, data: IIpcRendererData) => {
      position.value = data.data.position;
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_workAreaSize,
    (_event, data: IIpcRendererData) => {
      appStore.workAreaSize = {
        width: data.data.width,
        height: data.data.height,
      };
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_getPrimaryDisplaySize,
    (_event, data: IIpcRendererData) => {
      appStore.primaryDisplaySize = {
        width: data.data.width,
        height: data.data.height,
      };
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_getMousePosition,
    (_event, data: IIpcRendererData) => {
      console.log('response_getMousePosition', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_mouseScrollDown,
    (_event, data: IIpcRendererData) => {
      console.log('response_mouseScrollDown', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_mouseScrollUp,
    (_event, data: IIpcRendererData) => {
      console.log('response_mouseScrollUp', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_mouseScrollLeft,
    (_event, data: IIpcRendererData) => {
      console.log('response_mouseScrollLeft', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_mouseScrollRight,
    (_event, data: IIpcRendererData) => {
      console.log('response_mouseScrollRight', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_mouseMove,
    (_event, data: IIpcRendererData) => {
      console.log('response_mouseMove', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_mouseDrag,
    (_event, data: IIpcRendererData) => {
      console.log('response_mouseDrag', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_mouseSetPosition,
    (_event, data: IIpcRendererData) => {
      console.log('response_mouseSetPosition', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_mouseDoubleClick,
    (_event, data: IIpcRendererData) => {
      console.log('response_mouseDoubleClick', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_mousePressButtonLeft,
    (_event, data: IIpcRendererData) => {
      console.log('response_mousePressButtonLeft', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_mouseReleaseButtonLeft,
    (_event, data: IIpcRendererData) => {
      console.log('response_mouseReleaseButtonLeft', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_keyboardType,
    (_event, data: IIpcRendererData) => {
      console.log('response_keyboardType', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_mouseLeftClick,
    (_event, data: IIpcRendererData) => {
      console.log('response_mouseLeftClick', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_mouseRightClick,
    (_event, data: IIpcRendererData) => {
      console.log('response_mouseRightClick', data);
    }
  );

  ipcRenderer?.on(
    IPC_EVENT.response_getScreenStream,
    (_event, data: IIpcRendererData) => {
      if (data.code !== 0) {
        window.$message.error(data.msg || '');
        return;
      }
      chromeMediaSourceId.value = data.data.stream.id;
      handleDesktopStream(data.data.stream.id);
    }
  );
}

async function initDeskUser() {
  if (!cacheStore.deskUserUuid || !cacheStore.deskUserPassword) {
    const res = await fetchDeskUserCreate();
    if (res.code === 200) {
      cacheStore.deskUserUuid = res.data.uuid!;
      cacheStore.deskUserPassword = res.data.password!;
      originalPassword.value = res.data.password!;
      roomId.value = cacheStore.deskUserUuid;
    }
  } else {
    const res = await fetchDeskUserLogin({
      uuid: cacheStore.deskUserUuid,
      password: cacheStore.deskUserPassword,
    });
    if (res.code === 200) {
      originalPassword.value = cacheStore.deskUserPassword;
      roomId.value = cacheStore.deskUserUuid;
    }
  }
}

async function handleUpdatePassword() {
  if (cacheStore.deskUserPassword === originalPassword.value) return;
  if (
    cacheStore.deskUserPassword &&
    cacheStore.deskUserPassword.length > 6 &&
    cacheStore.deskUserPassword.length < 12
  ) {
    await fetchDeskUserUpdateByUuid({
      uuid: cacheStore.deskUserUuid!,
      password: originalPassword.value,
      new_password: cacheStore.deskUserPassword!,
    });
    originalPassword.value = cacheStore.deskUserPassword;
    window.$message.success('更新密码成功！');
  } else {
    window.$message.warning('密码长度要求6-12位！');
  }
}

watch(
  () => connectStatus.value,
  (newval) => {
    console.log('connectStatus', newval);
    if (newval === WsConnectStatusEnum.connect) {
      handleWsMsg();
    }
  }
);

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
          if (data.data.receiver === mySocketId.value) {
            appStore.remoteDesk.set(data.data.sender, {
              sender: data.data.sender,
              isClose: false,
              maxBitrate: data.data.maxBitrate,
              maxFramerate: data.data.maxFramerate,
              resolutionRatio: data.data.resolutionRatio,
              videoContentHint: data.data.videoContentHint,
              audioContentHint: data.data.audioContentHint,
            });
            handleRTC(data.data.sender);
          }
        }
      }
    }
  );
}

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
  } catch (err) {
    console.log(err);
  }
}

async function handleRTC(receiver) {
  if (!anchorStream.value) return;
  try {
    await handlConstraints({
      frameRate: currentMaxFramerate.value,
      height: currentResolutionRatio.value,
      stream: anchorStream.value,
    });
    setVideoTrackContentHints(
      anchorStream.value,
      // @ts-ignore
      currentVideoContentHint.value
    );
    setAudioTrackContentHints(
      anchorStream.value,
      // @ts-ignore
      currentAudioContentHint.value
    );
    updateWebRtcRemoteDeskConfig({
      roomId: roomId.value,
      anchorStream: anchorStream.value,
    });
    rtc.value = webRtcRemoteDesk.newWebRtc({
      // 因为这里是收到offer，而offer是房主发的，所以此时的data.data.sender是房主；data.data.receiver是接收者；
      // 但是这里的nativeWebRtc的sender，得是自己，不能是data.data.sender，不要混淆
      sender: mySocketId.value,
      receiver,
      videoEl: createNullVideo(),
    });
    webRtcRemoteDesk.sendOffer({
      sender: mySocketId.value,
      receiver,
    });
  } catch (err) {
    console.log(err);
  }
}

async function handleResetDeskuuid() {
  cacheStore.deskUserUuid = '';
  cacheStore.deskUserPassword = '';
  await initDeskUser();
  windowReload();
}

function handleCopy(str) {
  copyToClipBoard(str);
  window.$message.success('复制成功');
}

function startRemote() {
  if (cacheStore.remoteDeskUserUuid === '') {
    window.$message.warning('请输入被控uuid');
    return;
  }
  if (cacheStore.remoteDeskUserPassword === '') {
    window.$message.warning('请输入被控密码');
    return;
  }

  isControlOther.value = true;

  ipcRendererSend({
    windowId: 0,
    channel: IPC_EVENT.createWindow,
    requestId: getRandomString(8),
    data: {
      route: routerName.webrtc,
      query: {
        roomId: cacheStore.remoteDeskUserUuid,
        deskUserUuid: cacheStore.deskUserUuid,
        deskUserPassword: cacheStore.deskUserPassword,
        remoteDeskUserUuid: cacheStore.remoteDeskUserUuid,
        remoteDeskUserPassword: cacheStore.remoteDeskUserPassword,
        receiverId: receiverId.value,
        maxBitrate: currentMaxBitrate.value,
        maxFramerate: currentMaxFramerate.value,
        resolutionRatio: currentResolutionRatio.value,
        audioContentHint: currentAudioContentHint.value,
        videoContentHint: currentVideoContentHint.value,
      },
      useWorkAreaSize: true,
      frame: true,
    },
  });
}

function handleCloseAll() {
  anchorStream.value = undefined;
  appStore.remoteDesk.forEach((item) => {
    networkStore.removeRtc(item.sender);
  });
}

function handleDel(sender) {
  networkStore.removeRtc(sender);
}

// function handleTest() {
//   // mouseMove({ x: 690, y: 478 });
//   networkStore.rtcMap
//     .get(receiverId.value)
//     ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
//       requestId: getRandomString(8),
//       msgType: WsMsgTypeEnum.billdDeskBehavior,
//       data: {
//         roomId: roomId.value,
//         sender: mySocketId.value,
//         receiver: receiverId.value,
//         keyboardtype: 0,
//         type: BilldDeskBehaviorEnum.mouseMove,
//         x: 690,
//         y: 478,
//         amount: 0,
//       },
//     });
//   setTimeout(() => {
//     // mousePressButtonLeft();
//     networkStore.rtcMap
//       .get(receiverId.value)
//       ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
//         requestId: getRandomString(8),
//         msgType: WsMsgTypeEnum.billdDeskBehavior,
//         data: {
//           roomId: roomId.value,
//           sender: mySocketId.value,
//           receiver: receiverId.value,
//           keyboardtype: 0,
//           type: BilldDeskBehaviorEnum.pressButtonLeft,
//           x: 690,
//           y: 478,
//           amount: 0,
//         },
//       });
//   }, 50);
//   setTimeout(() => {
//     const num = 3;
//     for (let i = 0; i < num; i += 1) {
//       // mouseMove({ x: 690 + i, y: 478 });
//       // networkStore.rtcMap
//       //   .get(receiverId.value)
//       //   ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
//       //     requestId: getRandomString(8),
//       //     msgType: WsMsgTypeEnum.billdDeskBehavior,
//       //     data: {
//       //       roomId: roomId.value,
//       //       sender: mySocketId.value,
//       //       receiver: receiverId.value,
//       //       keyboardtype: 0,
//       //       type: BilldDeskBehaviorEnum.mouseMove,
//       //       x: 690 - i,
//       //       y: 478,
//       //       amount: 0,
//       //     },
//       //   });
//     }
//     setTimeout(() => {
//       // mouseReleaseButtonLeft();
//       networkStore.rtcMap
//         .get(receiverId.value)
//         ?.dataChannelSend<WsBilldDeskBehaviorType['data']>({
//           requestId: getRandomString(8),
//           msgType: WsMsgTypeEnum.billdDeskBehavior,
//           data: {
//             roomId: roomId.value,
//             sender: mySocketId.value,
//             receiver: receiverId.value,
//             keyboardtype: 0,
//             type: BilldDeskBehaviorEnum.releaseButtonLeft,
//             x: 690,
//             y: 478,
//             amount: 0,
//           },
//         });
//     }, 2000);
//   }, 300);
// }
function handleTest() {
  mouseMove({
    windowId: appStore.windowId,
    x: position.value.x + 200,
    y: position.value.y + 10,
  });
  setTimeout(() => {
    mousePressButtonLeft({ windowId: appStore.windowId });
  }, 50);
  setTimeout(() => {
    const num = 50;
    for (let i = 0; i < num; i += 1) {
      mouseMove({
        windowId: appStore.windowId,
        x: position.value.x + 200 + i,
        y: position.value.y + 10,
      });
    }
    mouseReleaseButtonLeft({ windowId: appStore.windowId });
  }, 300);
}
</script>

<style lang="scss" scoped>
.down {
  width: 150px;
}
.list {
  .item {
    .del {
      color: red;
      cursor: pointer;
    }
  }
}
</style>
