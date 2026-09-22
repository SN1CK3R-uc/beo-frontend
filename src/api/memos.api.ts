import { api } from './client';

export interface Memo {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorSignatureUrl?: string;
  to: string;
  from: string;
  date: string;
  subject: string;
  salute: string;
  body: string;
  readCount: number;
  totalRecipients: number;
  hasRead: boolean;
  createdAt: string;
}

export type MemoDraft = Pick<
  Memo,
  'to' | 'from' | 'date' | 'subject' | 'salute' | 'body'
>;

export const memosApi = {
  list: () => api.get<Memo[]>('/memos').then((r) => r.data),
  getById: (id: string) => api.get<Memo>(`/memos/${id}`).then((r) => r.data),
  create: (draft: MemoDraft) => api.post<Memo>('/memos', draft).then((r) => r.data),
  markRead: (id: string) => api.post<void>(`/memos/${id}/read`).then((r) => r.data),
  remove: (id: string) => api.delete(`/memos/${id}`).then((r) => r.data),
};