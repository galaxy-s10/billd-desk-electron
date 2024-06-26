import { IDeskUser } from '@/types/IUser';
import request from '@/utils/request';

export function fetchDeskUserCreate() {
  return request.post<IDeskUser>(`/desk_user/create`);
}
