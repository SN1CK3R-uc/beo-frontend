import { api } from './client';

export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export const notificationsApi = {
  list: () =>
    api.get<Notification[]>('/notifications').then((r) => r.data),

  markRead: (id: string) =>
    api.post<void>(`/notifications/${id}/read`).then((r) => r.data),
};