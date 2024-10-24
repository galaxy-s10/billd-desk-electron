<template>
  <div class="remote-wrap">
    <div class="container">
      <div class="local-device">
        <div class="label">此设备</div>
        <div class="info">
          <div class="info-left">
            <div class="txt">设备代码</div>
            <div class="code-info">
              <div class="code">{{ cacheStore.deskUserUuid }}</div>
              <div
                class="ico copy"
                @click="handleCopyRemoteInfo"
              ></div>
              <div
                class="ico refresh"
                @click="handleResetDeskuuid"
              ></div>
            </div>
          </div>
          <div class="info-right">
            <div class="txt">临时密码</div>
            <div class="code-info">
              <div class="code">
                {{
                  cacheStore.hidePwd ? '********' : cacheStore.deskUserPassword
                }}
              </div>
              <div
                class="ico eye"
                :class="{ hide: cacheStore.hidePwd }"
                @click="cacheStore.hidePwd = !cacheStore.hidePwd"
              ></div>
              <div
                class="ico edit"
                @click="handleUpdatePassword"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div class="remote-device">
        <div class="label">远程控制设备</div>
        <div class="info">
          <div class="ipt-wrap">
            <input
              type="text"
              class="ipt"
              v-model="cacheStore.remoteDeskUserUuid"
              :placeholder="'请输入远程设备代码'"
              maxlength="8"
            />
          </div>
          <div
            class="btn"
            :class="{ gray: !cacheStore.remoteDeskUserUuid.length }"
            @click="startRemote"
          >
            连接
          </div>
        </div>
      </div>

      <div
        v-if="!appStore.remoteDesk.size"
        class="tip"
      >
        已准备好连接
      </div>

      <div class="link-config">
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

      <div v-if="appStore.remoteDesk.size">
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

    <div
      class="debug-info"
      v-if="showDebug"
    >
      <div>
        <span
          class="link"
          @click="windowReload"
        >
          刷新页面
        </span>
        <span>，</span>
        <span
          class="link"
          @click="handleOpenDevTools({ windowId: appStore.windowId })"
        >
          打开调试
        </span>
      </div>
      <div>
        <span>窗口Id：</span>
        <span
          class="link"
          @click="handleCopy(appStore.windowId)"
        >
          {{ appStore.windowId }}
        </span>
      </div>
      <div>
        <span>socketId：</span>
        <span
          class="link"
          @click="handleCopy(mySocketId)"
        >
          {{ mySocketId }}
        </span>
        <span>，</span>
        <span>roomId：</span>
        <span
          class="link"
          @click="handleCopy(roomId)"
        >
          {{ roomId }}
        </span>
      </div>

      <div>
        <span>调试地址：</span>
        <input
          type="text"
          v-model="debugUrl"
        />
        <button @click="changeDebugUrl">确定</button>
      </div>
    </div>

    <PwdModalCpt
      v-if="showPwdModalCpt"
      :err-msg="errMsg"
      @close="showPwdModalCpt = false"
      @confirm="handleConfirm"
    ></PwdModalCpt>

    <InviteInfoCpt ref="inviteInfoCptRef"></InviteInfoCpt>
  </div>
</template>

<script lang="ts" setup>
import { copyToClipBoard, getRandomString, windowReload } from 'billd-utils';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  fetchDeskUserCreate,
  fetchDeskUserLinkVerify,
  fetchDeskUserLogin,
  fetchDeskUserUpdateByUuid,
  fetchFindReceiverByUuid,
} from '@/api/deskUser';
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
  ipcRendererOn,
  ipcRendererSend,
  setAudioTrackContentHints,
  setVideoTrackContentHints,
} from '@/utils';
import { WebRTCClass } from '@/utils/network/webRTC';
import InviteInfoCpt from '@/views/remote/inviteInfo.vue';
import PwdModalCpt from '@/views/remote/pwdModal.vue';

const route = useRoute();
const appStore = useAppStore();
const networkStore = useNetworkStore();
const cacheStore = usePiniaCacheStore();

const { updateWebRtcRemoteDeskConfig, webRtcRemoteDesk } =
  useWebRtcRemoteDesk();
const { initWs, connectStatus } = useWebsocket();
const {
  maxBitrate,
  maxFramerate,
  resolutionRatio,
  audioContentHint,
  videoContentHint,
} = useRTCParams();
const {
  handleMoveScreenRightBottom,
  handleScreen,
  handleRtcBilldDeskBehavior,
  handleOpenDevTools,
} = useIpcRendererSend();

const inviteInfoCptRef = ref<InstanceType<typeof InviteInfoCpt>>();
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
const showPwdModalCpt = ref(false);
const errMsg = ref('');
const chromeMediaSourceId = ref();
const showDebug = ref(false);
const originalPassword = ref('');
const loopBilldDeskUpdateUserTimer = ref();
const suspend = ref('');
const resume = ref('');
const debugUrl = ref('');
const position = ref({ x: 0, y: 0 });
const mySocketId = computed(() => {
  return networkStore.wsMap.get(roomId.value)?.socketIo?.id || '';
});

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

watch(
  () => appStore.windowId,
  (newval) => {
    if (newval !== -1) {
      handleInitIpcRendererOn();
      handleInitIpcRendererSend();
    }
  }
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
  ipcRendererOn(
    IPC_EVENT.response_scaleFactor,
    (_event, data: IIpcRendererData) => {
      if (data.data.platform !== 'darwin') {
        appStore.scaleFactor = data.data.scaleFactor;
      }
    }
  );

  ipcRendererOn(
    IPC_EVENT.response_powerMonitorSuspend,
    (_event, data: IIpcRendererData) => {
      console.log('response_powerMonitorSuspend', data);
      suspend.value = `${new Date().toLocaleString()}-powerMonitorSuspend`;
    }
  );

  ipcRendererOn(
    IPC_EVENT.response_powerMonitorResume,
    (_event, data: IIpcRendererData) => {
      console.log('response_powerMonitorResume', data);
      resume.value = `${new Date().toLocaleString()}-powerMonitorResume`;
      handleCloseAll();
    }
  );

  ipcRendererOn(
    IPC_EVENT.response_getWindowPosition,
    (_event, data: IIpcRendererData) => {
      position.value = data.data.position;
    }
  );

  ipcRendererOn(
    IPC_EVENT.response_workAreaSize,
    (_event, data: IIpcRendererData) => {
      appStore.workAreaSize = {
        width: data.data.width,
        height: data.data.height,
      };
    }
  );

  ipcRendererOn(
    IPC_EVENT.response_getPrimaryDisplaySize,
    (_event, data: IIpcRendererData) => {
      appStore.primaryDisplaySize = {
        width: data.data.width,
        height: data.data.height,
      };
    }
  );

  ipcRendererOn(
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
  cacheStore.deskUserPassword = getRandomString(8);
  // if (cacheStore.deskUserPassword === originalPassword.value) return;
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
    window.$message.success('更新临时密码成功！');
  } else {
    window.$message.warning('临时密码长度要求6-12位！');
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

function handleCopyRemoteInfo() {
  inviteInfoCptRef.value?.handleCopyRemoteInfo();
}

function changeDebugUrl() {
  window.location.href = debugUrl.value;
}

async function handleResetDeskuuid() {
  cacheStore.deskUserUuid = '';
  cacheStore.deskUserPassword = '';
  await initDeskUser();
  windowReload();
}

function handleCopy(str) {
  copyToClipBoard(str);
  window.$message.success('复制成功！');
}

async function handleConfirm(pwd: string) {
  errMsg.value = '';
  const res = await fetchDeskUserLinkVerify({
    uuid: cacheStore.remoteDeskUserUuid,
    password: pwd,
  });
  if (res.code == 200) {
    if (res.data.code === 1) {
      isControlOther.value = true;
      showPwdModalCpt.value = false;
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
            remoteDeskUserPassword: pwd,
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
    } else {
      errMsg.value = '密码错误，请重新输入';
    }
  } else {
    window.$message.error(res.message);
  }
}

async function startRemote() {
  if (cacheStore.remoteDeskUserUuid === '') {
    window.$message.warning('请输入远程设备代码！');
    return;
  }
  if (cacheStore.remoteDeskUserUuid === cacheStore.deskUserUuid) {
    window.$message.warning('不能连接自己！');
    return;
  }
  const res = await fetchFindReceiverByUuid(cacheStore.remoteDeskUserUuid);
  if (res.code === 200) {
    if (res.data.receiver !== '') {
      showPwdModalCpt.value = true;
    } else {
      window.$message.info('该设备不在线');
    }
  } else {
    window.$message.error(res.message);
  }
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
</script>

<style lang="scss" scoped>
.remote-wrap {
  position: relative;
  box-sizing: border-box;
  height: 100vh;

  .container {
    padding: 50px 40px 0;

    .local-device {
      padding-top: 20px;
      .label {
        margin-bottom: 10px;
        font-weight: 500;
        font-size: 24px;
      }
      .info {
        display: flex;
        justify-content: space-between;
        .info-left {
          .txt {
            margin-bottom: 6px;
            color: #999;
          }
          .code-info {
            display: flex;
            align-items: flex-end;
            .code {
              width: 180px;
              height: 40px;
              color: $theme-color-gold;
              font-size: 30px;

              user-select: text;
            }
            .ico {
              margin-right: 10px;
              width: 20px;
              height: 20px;
              cursor: pointer;

              &.copy {
                @include setBackground('@/assets/img/copy.png');
              }
              &.refresh {
                @include setBackground('@/assets/img/refresh.png');
              }
            }
          }
        }
        .info-right {
          .txt {
            margin-bottom: 6px;
            color: #999;
          }
          .code-info {
            display: flex;
            align-items: flex-end;
            .code {
              width: 180px;
              height: 40px;
              color: $theme-color-gold;
              font-size: 30px;

              user-select: text;
            }
            .ico {
              margin-right: 10px;
              width: 20px;
              height: 20px;
              cursor: pointer;

              &.eye {
                @include setBackground('@/assets/img/view.png');
              }
              &.hide {
                @include setBackground('@/assets/img/view_off.png');
              }
              &.edit {
                @include setBackground('@/assets/img/edit.png');
              }
            }
          }
        }
      }
    }
    .remote-device {
      padding-top: 20px;
      .label {
        font-weight: 500;
        font-size: 24px;
      }
      .info {
        display: flex;
        justify-content: space-between;
        margin-top: 5px;
        .ipt-wrap {
          width: 100%;
          .ipt {
            box-sizing: border-box;
            padding: 0 15px;
            width: 100%;
            height: 40px;
            outline: none;
            border: 1px solid rgba(153, 153, 153, 0.2);
            border-radius: 4px;
            color: #666;
            font-size: 16px;
            &::placeholder {
              color: #c2c2c2;
              font-size: 15px;
            }
            &:focus {
              border: 1px solid $theme-color-gold;
            }
          }
        }

        .btn {
          margin-left: 10px;
          width: 140px;
          height: 40px;
          border-radius: 4px;
          background-color: $theme-color-gold;
          color: white;
          text-align: center;
          font-size: 16px;
          line-height: 40px;
          cursor: pointer;
          &:hover {
            opacity: 0.8;
          }
          &.gray {
            opacity: 0.5;
            cursor: no-drop;
          }
        }
      }
    }
    .tip {
      margin-top: 10px;
      color: #666;
      font-size: 12px;
    }
    .link-config {
      margin-top: 10px;
    }
  }
  .invite-info {
    visibility: hidden;
    width: 0;
    height: 0;
  }
  .debug-info {
    position: fixed;
    right: 0;
    bottom: 0;
    padding-right: 5px;
    font-size: 12px;
    .link {
      color: red;
      cursor: pointer;
    }
  }
  .down {
    width: 120px;
  }
  .list {
    .item {
      .del {
        color: red;
        cursor: pointer;
      }
    }
  }
}
</style>
