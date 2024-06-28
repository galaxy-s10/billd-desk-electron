import { IDeskUser } from '@/types/IUser';
import request from '@/utils/request';

export function fetchDeskUserLogin(data: IDeskUser) {
  return request.post<IDeskUser>(`/desk_user/login`, data);
}

export function fetchDeskUserCreate() {
  return request.post<IDeskUser>(`/desk_user/create`);
}

export function fetchDeskUserUpdateByUuid(data: IDeskUser) {
  return request.put<IDeskUser>(`/desk_user/update_by_uuid`, data);
}
