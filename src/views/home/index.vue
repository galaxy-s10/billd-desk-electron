<template>
  <div>
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
        <n-button @click="handleOpenExternal(PROJECT_GITHUB)">打开</n-button>
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
          v-model:value="windowId"
          placeholder=""
          disabled
        />
        <n-button @click="handleCopy(windowId)">复制</n-button>
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
        <span>socketid：{{ item[1].sender }}，</span>
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
import { useRTCParams } from '@/hooks/use-rtcParams';
import { useTip } from '@/hooks/use-tip';
import { useWebsocket } from '@/hooks/use-websocket';
import { useWebRtcRemoteDesk } from '@/hooks/webrtc/remoteDesk';
import { routerName } from '@/router';
import { useAppStore } from '@/store/app';
import { usePiniaCacheStore } from '@/store/cache';
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

const currentMaxBitrate = ref(maxBitrate.value[3].value);
const currentMaxFramerate = ref(maxFramerate.value[4].value);
const currentResolutionRatio = ref(resolutionRatio.value[3].value);
const currentVideoContentHint = ref(videoContentHint.value[3].value);
const currentAudioContentHint = ref(audioContentHint.value[0].value);
const rtc = ref<WebRTCClass>();
const windowId = ref('');
const roomId = ref('');
const receiverId = ref('');
const anchorStream = ref<MediaStream>();
/** 是否控制别人 */
const isControlOther = ref(false);
const isAlwaysOnTop = ref(true);
const chromeMediaSourceId = ref();
const mySocketId = computed(() => {
  return networkStore.wsMap.get(roomId.value)?.socketIo?.id || '';
});

const originalPassword = ref('');
const loopBilldDeskUpdateUserTimer = ref();
const suspend = ref('');
const resume = ref('');
const scaleFactor = ref(1);
const position = ref({ x: 0, y: 0 });

const ipcRenderer = window.electronAPI.ipcRenderer;

onUnmounted(() => {
  networkStore.removeAllWsAndRtc();
  handleCloseAll();
  clearInterval(loopBilldDeskUpdateUserTimer.value);
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

watch(
  () => isAlwaysOnTop.value,
  () => {
    handleMainWindowSetAlwaysOnTop(isAlwaysOnTop.value);
  },
  { immediate: true }
);

async function handleInit() {
  await initUser();
  handleLoopBilldDeskUpdateUserTimer();
  initWs({
    roomId: roomId.value,
    isAnchor: false,
    isRemoteDesk: true,
  });
}
onMounted(() => {
  console.log('route.query', route.query);
  handleInit();
  ipcRendererSend({
    channel: IPC_EVENT.getMainWindowId,
    data: { requestId: getRandomString(8), data: {} },
  });

  ipcRendererSend({
    channel: IPC_EVENT.scaleFactor,
    data: { requestId: getRandomString(8), data: {} },
  });

  // setInterval(() => {
  //   ipcRendererSend({
  //     channel: IPC_EVENT.getWindowPosition,
  //     data: { requestId: getRandomString(8), data: {} },
  //   });
  // }, 1000);

  ipcRenderer.on(IPC_EVENT.response_scaleFactor, (_event, data) => {
    if (data.platform !== 'darwin') {
      scaleFactor.value = data.scaleFactor;
    }
  });

  ipcRenderer.on(IPC_EVENT.response_powerMonitorSuspend, (_event, data) => {
    console.log('powerMonitorSuspend', data);
    suspend.value = `${new Date().toLocaleString()}-powerMonitorSuspend`;
  });

  ipcRenderer.on(IPC_EVENT.response_getWindowPosition, (_event, data) => {
    console.log('getWindowPosition', data);
    position.value = data.position;
  });

  ipcRenderer.on(IPC_EVENT.response_powerMonitorResume, (_event, data) => {
    console.log('powerMonitorResume', data);
    resume.value = `${new Date().toLocaleString()}-powerMonitorResume`;
    handleCloseAll();
  });

  ipcRenderer.on(IPC_EVENT.response_workAreaSize, (_event, data) => {
    appStore.workAreaSize.width = data.width;
    appStore.workAreaSize.height = data.height;
  });

  ipcRenderer.on(IPC_EVENT.response_getPrimaryDisplaySize, (_event, data) => {
    appStore.primaryDisplaySize.width = data.width;
    appStore.primaryDisplaySize.height = data.height;
  });

  ipcRendererSend({
    channel: IPC_EVENT.workAreaSize,
    data: { requestId: getRandomString(8), data: {} },
  });

  ipcRendererSend({
    channel: IPC_EVENT.getPrimaryDisplaySize,
    data: { requestId: getRandomString(8), data: {} },
  });

  ipcRenderer.on(IPC_EVENT.response_getMainWindowId, (_event, data) => {
    windowId.value = `${data.id as string}`;
  });

  ipcRenderer.on(IPC_EVENT.response_createWindow, (_event, data) => {
    ipcRendererSend({
      channel: IPC_EVENT.childWindowInit,
      data: { requestId: getRandomString(8), data: { id: data.id } },
    });
  });

  ipcRenderer.on(IPC_EVENT.response_getMousePosition, (_event, data) => {
    console.log('getMousePosition', data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseScrollDown, (_event, data) => {
    console.log('mouseScrollDown', data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseScrollUp, (_event, data) => {
    console.log('mouseScrollUp', data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseScrollLeft, (_event, data) => {
    console.log('mouseScrollLeft', data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseScrollRight, (_event, data) => {
    console.log('mouseScrollRight', data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseMove, (_event, data) => {
    console.log('mouseMove', data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseDrag, (_event, data) => {
    console.log('mouseDrag', data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseSetPosition, (_event, data) => {
    console.log('mouseSetPosition', data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseDoubleClick, (_event, data) => {
    console.log('mouseDoubleClick', data);
  });

  ipcRenderer.on(IPC_EVENT.response_mousePressButtonLeft, (_event, data) => {
    console.log('mousePressButtonLeft', data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseReleaseButtonLeft, (_event, data) => {
    console.log('mouseReleaseButtonLeft', data);
  });

  ipcRenderer.on(IPC_EVENT.response_keyboardType, (_event, data) => {
    console.log('keyboardType', data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseLeftClick, (_event, data) => {
    console.log('mouseLeftClick', data);
  });

  ipcRenderer.on(IPC_EVENT.response_mouseRightClick, (_event, data) => {
    console.log('mouseRightClick', data);
  });

  ipcRenderer.on(IPC_EVENT.response_getScreenStream, (_event, data) => {
    console.log('收到getScreenStream', data);
    if (data.isErr) {
      window.$message.error(data.msg);
      return;
    }
    chromeMediaSourceId.value = data.stream.id;
    handleDesktopStream(data.stream.id);
  });
});

async function initUser() {
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
    originalPassword.value = cacheStore.deskUserPassword;
    if (res.code === 200) {
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
  await initUser();
  windowReload();
}

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
    channel: IPC_EVENT.createWindow,
    data: {
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
          width: appStore.workAreaSize.width,
          height: appStore.workAreaSize.height,
          maxBitrate: currentMaxBitrate.value,
          maxFramerate: currentMaxFramerate.value,
          resolutionRatio: currentResolutionRatio.value,
          audioContentHint: currentAudioContentHint.value,
          videoContentHint: currentVideoContentHint.value,
          scaleFactor: scaleFactor.value,
        },
        x: 0,
        y: 0,
        useWorkAreaSize: true,
      },
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
  console.log('handleDel', sender);
  networkStore.removeRtc(sender);
}

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
          if (appStore.primaryDisplaySize) {
            const x =
              (appStore.primaryDisplaySize.width || 0) *
              scaleFactor.value *
              (data.x / 1000);
            const y =
              (appStore.primaryDisplaySize.height || 0) *
              scaleFactor.value *
              (data.y / 1000);
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
            } else if (data.type === BilldDeskBehaviorEnum.scrollDown) {
              mouseScrollDown({ amount: data.amount });
            } else if (data.type === BilldDeskBehaviorEnum.scrollUp) {
              mouseScrollUp({ amount: data.amount });
            } else if (data.type === BilldDeskBehaviorEnum.scrollLeft) {
              mouseScrollLeft({ amount: data.amount });
            } else if (data.type === BilldDeskBehaviorEnum.scrollRight) {
              mouseScrollRight({ amount: data.amount });
            }
          }
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
        handleMoveScreenRightBottom();
      }
      if (!anchorStream.value) {
        handleScreen();
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

/** 将程序主窗口移动到屏幕右下角 */
function handleMoveScreenRightBottom() {
  ipcRendererSend({
    channel: IPC_EVENT.handleMoveScreenRightBottom,
    data: { requestId: getRandomString(8), data: {} },
  });
}

/** 将程序主窗口指定 */
function handleMainWindowSetAlwaysOnTop(flag: boolean) {
  ipcRendererSend({
    channel: IPC_EVENT.mainWindowSetAlwaysOnTop,
    data: { requestId: getRandomString(8), data: { flag } },
  });
}

function handleScreen() {
  ipcRendererSend({
    channel: IPC_EVENT.getScreenStream,
    data: { requestId: getRandomString(8), data: {} },
  });
}

function mouseSetPosition({ x, y }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseSetPosition,
    data: { requestId: getRandomString(8), data: { x, y } },
  });
}

function mouseMove({ x, y }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseMove,
    data: { requestId: getRandomString(8), data: { x, y } },
  });
}

function mouseDrag({ x, y }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseDrag,
    data: { requestId: getRandomString(8), data: { x, y } },
  });
}

function mouseDoubleClick() {
  ipcRendererSend({
    channel: IPC_EVENT.mouseDoubleClick,
    data: { requestId: getRandomString(8), data: {} },
  });
}

function mousePressButtonLeft() {
  ipcRendererSend({
    channel: IPC_EVENT.mousePressButtonLeft,
    data: { requestId: getRandomString(8), data: {} },
  });
}

function keyboardType({ key }) {
  ipcRendererSend({
    channel: IPC_EVENT.keyboardType,
    data: { requestId: getRandomString(8), data: { key } },
  });
}

function mouseReleaseButtonLeft() {
  ipcRendererSend({
    channel: IPC_EVENT.mouseReleaseButtonLeft,
    data: { requestId: getRandomString(8), data: {} },
  });
}

function mouseLeftClick({ x, y }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseLeftClick,
    data: { requestId: getRandomString(8), data: { x, y } },
  });
}

function mouseRightClick({ x, y }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseRightClick,
    data: { requestId: getRandomString(8), data: { x, y } },
  });
}

function handleDebug() {
  ipcRendererSend({
    channel: IPC_EVENT.handleOpenDevTools,
    data: { requestId: getRandomString(8), data: {} },
  });
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
  mouseMove({ x: position.value.x + 200, y: position.value.y + 10 });
  setTimeout(() => {
    mousePressButtonLeft();
  }, 50);
  setTimeout(() => {
    const num = 50;
    for (let i = 0; i < num; i += 1) {
      mouseMove({ x: position.value.x + 200 + i, y: position.value.y + 10 });
    }
    mouseReleaseButtonLeft();
  }, 300);
}

function mouseScrollDown({ amount }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseScrollDown,
    data: { requestId: getRandomString(8), data: { amount } },
  });
}

function mouseScrollUp({ amount }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseScrollUp,
    data: { requestId: getRandomString(8), data: { amount } },
  });
}

function mouseScrollLeft({ amount }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseScrollLeft,
    data: { requestId: getRandomString(8), data: { amount } },
  });
}

function mouseScrollRight({ amount }) {
  ipcRendererSend({
    channel: IPC_EVENT.mouseScrollRight,
    data: { requestId: getRandomString(8), data: { amount } },
  });
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
