<template>
  <div class="setting-wrap">
    <div class="nav"></div>
    <div class="container">
      <div class="item">
        <div class="label">界面设置</div>
        <div class="value">
          <n-space>
            <div>主窗口置顶：</div>
            <n-radio
              :checked="cacheStore.isAlwaysOnTop"
              @change="cacheStore.isAlwaysOnTop = true"
            >
              是
            </n-radio>
            <n-radio
              :checked="!cacheStore.isAlwaysOnTop"
              @change="cacheStore.isAlwaysOnTop = false"
            >
              否
            </n-radio>
          </n-space>
        </div>
      </div>
      <div class="hr"></div>
      <div class="item">
        <div class="label">接口信息</div>
        <div class="value">
          <div class="v-item one">
            <span
              class="link"
              @click="handleCopy(WEBSOCKET_URL)"
            >
              wss：{{ WEBSOCKET_URL }}
            </span>
          </div>
          <div class="v-item two">
            <span>axios：</span>
            <span
              class="link"
              @click="
                handleOpenExternal({
                  windowId: appStore.windowId,
                  url: AXIOS_BASEURL,
                })
              "
            >
              <span>{{ AXIOS_BASEURL }}</span>
              <span>
                <VPIconExternalLink class="icon"></VPIconExternalLink>
              </span>
            </span>
          </div>
          <div class="v-item two">
            <span
              class="link"
              @click="handleCopy(`turn:hk.${prodDomain}`)"
            >
              coturn：{{ `turn:hk.${prodDomain}` }}
            </span>
          </div>
        </div>
      </div>
      <div class="hr"></div>
      <div class="item">
        <div class="label">作者信息</div>
        <div class="value">
          <div class="v-item one">
            <span
              class="link"
              @click="handleCopy(AUTHOR_INFO.wechat)"
            >
              微信：{{ AUTHOR_INFO.wechat }}
            </span>
          </div>
          <div class="v-item two">
            <span
              class="link"
              @click="handleCopy(AUTHOR_INFO.qq)"
            >
              QQ：{{ AUTHOR_INFO.qq }}
            </span>
          </div>
          <div class="v-item two">
            <span>
              <span>Github：</span>
              <span
                class="link"
                @click="
                  handleOpenExternal({
                    windowId: appStore.windowId,
                    url: AUTHOR_INFO.github,
                  })
                "
              >
                <span>{{ AUTHOR_INFO.github }}</span>
                <VPIconExternalLink class="icon"></VPIconExternalLink>
              </span>
            </span>
          </div>
        </div>
      </div>
      <div class="hr"></div>
      <div class="item">
        <div class="label">网页版体验</div>
        <div class="value">
          <div class="v-item one">
            <span
              class="link"
              @click="
                handleOpenExternal({
                  windowId: appStore.windowId,
                  url: WEB_DESK_URL,
                })
              "
            >
              <span>{{ WEB_DESK_URL }}</span>
              <VPIconExternalLink class="icon"></VPIconExternalLink>
            </span>
          </div>
        </div>
      </div>
      <div class="hr"></div>
      <div class="item">
        <div class="label">私有化部署</div>
        <div class="value">
          <div class="v-item one">
            <span
              class="link"
              @click="
                handleOpenExternal({
                  windowId: appStore.windowId,
                  url: COMMON_URL.privatizationDeployment,
                })
              "
            >
              <span>了解详情</span>
              <VPIconExternalLink class="icon"></VPIconExternalLink>
            </span>
          </div>
        </div>
      </div>
      <div class="hr"></div>
      <div class="item">
        <div class="label">下载客户端</div>
        <div class="value">
          <div class="v-item one">
            <div class="client-list">
              <div
                v-for="(item, index) in clientList"
                :key="index"
                class="client-btn"
                @click="
                  handleOpenExternal({
                    windowId: appStore.windowId,
                    url: item.url,
                  })
                "
              >
                <div class="name">{{ item.label }}</div>
                <div class="ext">{{ item.ext }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="hr"></div>
      <div class="item">
        <div class="label">关于{{ PRODUCT_NAME }}</div>
        <div class="value">
          <div class="v-item one">
            <span>
              当前版本：v{{ appStore.version }}（{{ appStore.lastBuildDate }}）
            </span>
            <span
              class="btn"
              @click="handleDeskVersionCheck"
            >
              检查更新
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { copyToClipBoard } from 'billd-utils';
import { ref, watch } from 'vue';

import { fetchDeskVersionCheck } from '@/api/deskVersion';
import {
  AUTHOR_INFO,
  AXIOS_BASEURL,
  COMMON_URL,
  PRODUCT_NAME,
  WEB_DESK_URL,
  WEBSOCKET_URL,
} from '@/constant';
import { useIpcRendererSend } from '@/hooks/use-ipcRendererSend';
import { prodDomain } from '@/spec-config';
import { useAppStore } from '@/store/app';
import { usePiniaCacheStore } from '@/store/cache';

const appStore = useAppStore();
const cacheStore = usePiniaCacheStore();

const { handleOpenExternal, handlesetAlwaysOnTop } = useIpcRendererSend();

const clientList = ref<
  {
    label: string;
    ext: string;
    url: string;
  }[]
>([]);

function handleCopy(str) {
  copyToClipBoard(str);
  window.$message.success('复制成功！');
}

watch(
  () => cacheStore.isAlwaysOnTop,
  () => {
    handlesetAlwaysOnTop({
      windowId: appStore.windowId,
      flag: cacheStore.isAlwaysOnTop,
    });
  },
  { immediate: true }
);

watch(
  () => appStore.deskVersionInfo,
  (newval) => {
    if (newval) {
      Object.keys(newval).forEach((item) => {
        if (item.indexOf('download_linux') !== -1) {
          const arr = item.split('_');
          const bit = arr[2] === 'arm' ? 'arm' : `${arr[2]}bit`;
          clientList.value.push({
            label: `${arr[1]}(${bit})`,
            ext: arr[3],
            url: newval[item],
          });
        }
        if (item.indexOf('download_windows') !== -1) {
          const arr = item.split('_');
          const bit = arr[2] === 'arm' ? 'arm' : `${arr[2]}bit`;
          clientList.value.push({
            label: `${arr[1]}(${bit})`,
            ext: arr[3],
            url: newval[item],
          });
        }
        if (item.indexOf('download_macos') !== -1) {
          const arr = item.split('_');
          clientList.value.push({
            label: `${arr[1]}`,
            ext: arr[2],
            url: newval[item],
          });
        }
      });
    }
  },
  { immediate: true, deep: true }
);

async function handleDeskVersionCheck() {
  const res = await fetchDeskVersionCheck(appStore.version);
  if (res.code === 200 && res.data) {
    appStore.updateModalInfo = res.data;
    if (appStore.updateModalInfo?.checkUpdate === 2) {
      window.$message.success('当前不需要更新');
    } else if (appStore.updateModalInfo?.isUpdate === 2) {
      window.$message.success('当前是最新版本');
    }
  }
}
</script>

<style lang="scss" scoped>
.setting-wrap {
  box-sizing: border-box;
  height: 100vh;
  .nav {
    height: $top-system-bar-height;
  }
  .container {
    overflow: scroll;
    padding: 0 40px;
    height: calc(100vh - $top-system-bar-height);

    @extend %customScrollbarHide;
    &:hover {
      @extend %customScrollbar;
    }
    .item {
      display: flex;
      margin-bottom: 20px;
      .icon {
        margin-left: 5px;
        width: 12px;
        height: 12px;
        vertical-align: middle;
      }
      .label {
        margin-right: 20px;
        width: 100px;
        text-align: right;
        font-weight: 500;
        font-size: 15px;
      }
      .value {
        flex: 1;
        color: #666;
        font-size: 14px;
        .v-item {
          .link {
            cursor: pointer;
          }
          &.one {
            .btn {
              padding: 2px 10px;
              border: 1px solid #bec3ca;
              border-radius: 20px;
              font-size: 12px;
              cursor: pointer;

              user-select: none;
            }
            .client-list {
              display: flex;
              flex-wrap: wrap;
              .client-btn {
                display: flex;
                margin-right: 10px;
                margin-bottom: 10px;
                height: 30px;
                border-radius: 5px;
                background: #448ccb;
                color: white;
                font-size: 14px;
                line-height: 30px;
                cursor: pointer;

                user-select: none;
                .name {
                  width: 120px;
                  text-align: center;
                }
                .ext {
                  width: 40px;
                  background-color: #0000005c;
                  text-align: center;
                }
              }
            }
          }
          &.two {
            margin-top: 5px;
            .btn {
              margin-right: 10px;
              padding: 2px 10px;
              border: 1px solid #bec3ca;
              border-radius: 20px;
              font-size: 12px;
              cursor: pointer;

              user-select: none;
            }
          }
        }
      }
    }
    .hr {
      margin: 20px 0;
      width: 100%;
      height: 1px;
      background-color: #ebedf1;
    }
  }
}
</style>
