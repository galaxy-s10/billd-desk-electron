<template>
  <div>
    <div>
      <div>
        <div>{{ suspend }}</div>
        <div>{{ resume }}</div>
        <div>version：{{ appStore.version }}</div>
        <div>wss：{{ WEBSOCKET_URL }}</div>
        <div>axios：{{ AXIOS_BASEURL }}</div>
        <div>
          github：<span
            class="link"
            @click="handleCopy(PROJECT_GITHUB)"
          >
            {{ PROJECT_GITHUB }}
          </span>
        </div>
        <div>
          web端：<span
            class="link"
            @click="handleCopy(WEB_DESK_URL)"
          >
            {{ WEB_DESK_URL }}
          </span>
        </div>
      </div>
      <n-input-group>
        <n-input-group-label>窗口id</n-input-group-label>
        <n-input
          v-model:value="windowId"
          :style="{ width: '200px' }"
          placeholder=""
          disabled
        />
        <n-button @click="handleCopy(windowId)">复制</n-button>
      </n-input-group>
      <n-input-group>
        <n-input-group-label>roomId</n-input-group-label>
        <n-input
          v-model:value="roomId"
          :style="{ width: '200px' }"
          disabled
          placeholder=""
        />
        <n-button @click="handleCopy(roomId)">复制</n-button>
      </n-input-group>
      <n-input-group>
        <n-input-group-label>socketId</n-input-group-label>
        <n-input
          v-model:value="mySocketId"
          :style="{ width: '200px' }"
          placeholder=""
          disabled
        />
        <n-button @click="handleCopy(mySocketId)">复制</n-button>
      </n-input-group>
      <n-input-group>
        <n-input-group-label>主控uuid</n-input-group-label>
        <n-input
          v-model:value="cacheStore.deskUserUuid"
          :style="{ width: '200px' }"
          placeholder=""
          disabled
        />
        <n-button @click="handleCopy(cacheStore.deskUserUuid)">复制</n-button>
        <n-button @click="handleResetDeskuuid">重置</n-button>
      </n-input-group>
      <n-input-group>
        <n-input-group-label>主控密码</n-input-group-label>
        <n-input
          v-model:value="cacheStore.deskUserPassword"
          :style="{ width: '200px' }"
          @blur="handleUpdatePassword"
          placeholder=""
        />
        <n-button @click="handleCopy(cacheStore.deskUserPassword)">
          复制
        </n-button>
      </n-input-group>
      <n-input-group>
        <n-input-group-label>被控uuid</n-input-group-label>
        <n-input
          v-model:value="cacheStore.remoteDeskUserUuid"
          :style="{ width: '200px' }"
          placeholder=""
        />
        <n-button
          @click="startRemote"
          type="primary"
        >
          开始远程
        </n-button>
      </n-input-group>
    </div>
    <div class="rtc-config">
      <div class="item">
        <div class="txt">码率：</div>
        <div class="down">
          <n-select
            size="small"
            v-model:value="currentMaxBitrate"
            :options="maxBitrate"
          />
        </div>
      </div>
      <div class="item">
        <div class="txt">帧率：</div>
        <div class="down">
          <n-select
            size="small"
            v-model:value="currentMaxFramerate"
            :options="maxFramerate"
          />
        </div>
      </div>
      <div class="item">
        <div class="txt">分辨率：</div>
        <div class="down big">
          <n-select
            size="small"
            v-model:value="currentResolutionRatio"
            :options="resolutionRatio"
          />
        </div>
      </div>
    </div>
    <div class="rtc-config">
      <div class="item">
        <div class="txt">视频内容：</div>
        <div class="down">
          <n-select
            size="small"
            v-model:value="currentVideoContentHint"
            :options="videoContentHint"
          />
        </div>
      </div>
      <div class="item">
        <div class="txt">音频内容：</div>
        <div class="down big">
          <n-select
            size="small"
            v-model:value="currentAudioContentHint"
            :options="audioContentHint"
          />
        </div>
      </div>
    </div>
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
    <div>
      <n-button @click="windowReload">刷新页面</n-button>
      <n-button @click="handleDebug">打开调试</n-button>
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
  AXIOS_BASEURL,
  PROJECT_GITHUB,
  WEBSOCKET_URL,
  WEB_DESK_URL,
} from '@/constant';
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
const chromeMediaSourceId = ref();
const mySocketId = computed(() => {
  return networkStore.wsMap.get(roomId.value)?.socketIo?.id || '';
});

const originalPassword = ref('');
const loopBilldDeskUpdateUserTimer = ref();
const suspend = ref('');
const resume = ref('');

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
      },
    });
  }, 1000 * 2);
}

async function handleInit() {
  await initUser();
  handleLoopBilldDeskUpdateUserTimer();
  handleMainWindowSetAlwaysOnTop(true);
  initWs({
    roomId: roomId.value,
    isAnchor: false,
    isRemoteDesk: true,
  });
}
onMounted(() => {
  console.log('route.query', route.query);
  handleInit();
  window.electronAPI.ipcRenderer.send('getMainWindowId', {
    type: 'getMainWindowId',
  });

  window.electronAPI.ipcRenderer.on(
    'powerMonitor-suspend',
    (_event, source) => {
      console.log('powerMonitor-suspend', source);
      suspend.value = `${new Date().toLocaleString()}-suspend`;
    }
  );
  window.electronAPI.ipcRenderer.on('powerMonitor-resume', (_event, source) => {
    console.log('powerMonitor-resume', source);
    resume.value = `${new Date().toLocaleString()}-resume`;
    handleCloseAll();
  });

  window.electronAPI.ipcRenderer.on('workAreaSizeRes', (_event, source) => {
    console.log('workAreaSizeRes', source);
    appStore.workAreaSize.width = source.width;
    appStore.workAreaSize.height = source.height;
  });

  window.electronAPI.ipcRenderer.on(
    'getPrimaryDisplaySizeRes',
    (_event, source) => {
      console.log('getPrimaryDisplaySizeRes', source);
      appStore.primaryDisplaySize.width = source.width;
      appStore.primaryDisplaySize.height = source.height;
    }
  );

  window.electronAPI.ipcRenderer.send('workAreaSize');
  window.electronAPI.ipcRenderer.send('getPrimaryDisplaySize');

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

async function initUser() {
  if (!cacheStore.deskUserUuid || !cacheStore.deskUserPassword) {
    console.log('生成账号');
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
      roomId.value = cacheStore.deskUserUuid;
    }
  }
}

async function handleUpdatePassword() {
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
  if (!ws?.socketIo) return;
  // 收到billdDeskStartRemoteResult
  ws.socketIo.on(
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
        if (!data.data) return;
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

function startRemote() {
  if (cacheStore.remoteDeskUserUuid === '') {
    window.$message.warning('请输入被控uuid');
    return;
  }

  isControlOther.value = true;
  window.electronAPI.ipcRenderer.send('createWindow', {
    type: 'createWindow',
    data: {
      route: routerName.webrtc,
      query: {
        roomId: cacheStore.remoteDeskUserUuid,
        deskUserUuid: cacheStore.deskUserUuid,
        deskUserPassword: cacheStore.deskUserPassword,
        remoteDeskUserUuid: cacheStore.remoteDeskUserUuid,
        receiverId: receiverId.value,
        width: appStore.workAreaSize.width,
        height: appStore.workAreaSize.height,
        maxBitrate: currentMaxBitrate.value,
        maxFramerate: currentMaxFramerate.value,
        resolutionRatio: currentResolutionRatio.value,
        audioContentHint: currentAudioContentHint.value,
        videoContentHint: currentVideoContentHint.value,
      },
      x: 0,
      y: 0,
      useWorkAreaSize: true,
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
      const setting = anchorStream.value?.getVideoTracks()[0].getSettings();
      item.cbDataChannel.onmessage = (event) => {
        console.log('dataChannel-onmessage', event);
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
              (appStore.primaryDisplaySize.width || 0) * (data.x / 1000);
            const y =
              (appStore.primaryDisplaySize.height || 0) * (data.y / 1000);
            console.log(
              JSON.stringify(setting),
              appStore.primaryDisplaySize,
              '----'
            );
            if (data.type === BilldDeskBehaviorEnum.setPosition) {
              mouseSetPosition(x, y);
            } else if (data.type === BilldDeskBehaviorEnum.mouseMove) {
              mouseMove(x, y);
            } else if (data.type === BilldDeskBehaviorEnum.mouseDrag) {
              mouseDrag(x, y);
            } else if (data.type === BilldDeskBehaviorEnum.leftClick) {
              mouseLeftClick(x, y);
            } else if (data.type === BilldDeskBehaviorEnum.rightClick) {
              mouseRightClick(x, y);
            } else if (data.type === BilldDeskBehaviorEnum.doubleClick) {
              mouseDoubleClick(x, y);
            } else if (data.type === BilldDeskBehaviorEnum.pressButtonLeft) {
              mousePressButtonLeft(x, y);
            } else if (data.type === BilldDeskBehaviorEnum.releaseButtonLeft) {
              mouseReleaseButtonLeft(x, y);
            } else if (data.type === BilldDeskBehaviorEnum.keyboardType) {
              keyboardType(data.keyboardtype);
            } else if (data.type === BilldDeskBehaviorEnum.scrollDown) {
              mouseScrollDown(data.amount);
            } else if (data.type === BilldDeskBehaviorEnum.scrollUp) {
              mouseScrollUp(data.amount);
            } else if (data.type === BilldDeskBehaviorEnum.scrollLeft) {
              mouseScrollLeft(data.amount);
            } else if (data.type === BilldDeskBehaviorEnum.scrollRight) {
              mouseScrollRight(data.amount);
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
  window.electronAPI.ipcRenderer.send('handleMoveScreenRightBottom');
}
/** 将程序主窗口指定 */
function handleMainWindowSetAlwaysOnTop(flag: boolean) {
  window.electronAPI.ipcRenderer.send('mainWindowSetAlwaysOnTop', {
    type: 'mainWindowSetAlwaysOnTop',
    data: { flag },
  });
}

function handleScreen() {
  window.electronAPI.ipcRenderer.send('getScreenStream');
}

function mouseSetPosition(x, y) {
  window.electronAPI.ipcRenderer.send('mouseSetPosition', x, y);
}
function mouseMove(x, y) {
  console.log('mouseMovemouseMove', x, y);
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
  color: $theme-color-gold;
  cursor: pointer;
}
.rtc-config {
  display: flex;
  .item {
    display: flex;
    align-items: center;
    padding-right: 10px;

    .down {
      width: 150px;
    }
  }
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
