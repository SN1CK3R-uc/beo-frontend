import { api } from './client';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: 'announcement' | 'meeting' | 'event';
  linkUrl?: string;
  linkLabel?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
}

export const announcementsApi = {
  list: () => api.get<Announcement[]>('/announcements').then((r) => r.data),

  create: (payload: {
    title: string;
    body: string;
    type?: 'announcement' | 'meeting' | 'event';
    linkUrl?: string;
    linkLabel?: string;
    expiresAt?: string;
  }) => api.post<Announcement>('/announcements', payload).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/announcements/${id}`).then((r) => r.data),
};