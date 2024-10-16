import { defineStore } from 'pinia';

import { lsKeyPrefix } from '@/constant';
import { AppRootState } from '@/store/app';

export type PiniaCacheRootState = {
  muted: boolean;
  volume: number;
  deskUserUuid: string;
  deskUserPassword: string;
  remoteDeskUserUuid: string;
  'resource-list': AppRootState['allTrack'];
};

export const usePiniaCacheStore = defineStore(`${lsKeyPrefix}pinia-cache`, {
  persist: {
    key: `${lsKeyPrefix}pinia-cache`,
  },
  state: (): PiniaCacheRootState => {
    return {
      muted: true,
      volume: 70,
      deskUserUuid: '',
      deskUserPassword: '',
      remoteDeskUserUuid: '',
      'resource-list': [],
    };
  },
  actions: {
    setResourceList(res: PiniaCacheRootState['resource-list']) {
      this['resource-list'] = res;
    },
    setMuted(res: PiniaCacheRootState['muted']) {
      this.muted = res;
    },
    setVolume(res: PiniaCacheRootState['volume']) {
      this.volume = res;
    },
  },
});
