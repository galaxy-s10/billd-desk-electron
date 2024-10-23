import request from '@/utils/request';

export function fetchDeskVersionCheck(version) {
  return request.get(`/desk_version/check`, { params: { version } });
}

export function fetchDeskVersionByVersion(version) {
  return request.get(`/desk_version/find_by_version`, { params: { version } });
}
