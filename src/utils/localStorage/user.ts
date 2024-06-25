import { lsKey } from '@/constant';
import cache from '@/utils/cache';

export const getUid = () => {
  return cache.getStorage<string>(lsKey.uid);
};
export const setUid = (val: string) => {
  return cache.setStorage(lsKey.uid, val);
};
export const clearUid = () => {
  return cache.clearStorage(lsKey.uid);
};

export const getToken = () => {
  return cache.getStorage<string>(lsKey.token);
};
export const setToken = (val: string) => {
  return cache.setStorage(lsKey.token, val);
};
export const clearToken = () => {
  return cache.clearStorage(lsKey.token);
};
