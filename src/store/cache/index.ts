import { defineStore } from 'pinia';

import { LS_KEY_PREFIX } from '@/constant';

export type PiniaCacheRootState = {
  muted: boolean;
  volume: number;
  deskUserUuid: string;
  deskUserPassword: string;
  remoteDeskUserUuid: string;
  remoteDeskUserPassword: string;
};

export const usePiniaCacheStore = defineStore(`${LS_KEY_PREFIX}pinia-cache`, {
  persist: {
    key: `${LS_KEY_PREFIX}pinia-cache`,
  },
  state: (): PiniaCacheRootState => {
    return {
      muted: true,
      volume: 70,
      deskUserUuid: '',
      deskUserPassword: '',
      remoteDeskUserUuid: '',
      remoteDeskUserPassword: '',
    };
  },
  actions: {},
});
