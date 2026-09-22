import { api } from './client';

export interface Meeting {
  id: string;
  title: string;
  date: string;
  location: string;
  duration: string;
  chairperson: string;
  tag: string;
  minutes?: string;
  cancelled?: boolean;
}

export const meetingsApi = {
  list: () => api.get<Meeting[]>('/meetings').then((r) => r.data),
  create: (payload: Partial<Meeting>) => api.post<Meeting>('/meetings', payload).then((r) => r.data),
  update: (id: string, payload: Partial<Meeting>) => api.patch<Meeting>(`/meetings/${id}`, payload).then((r) => r.data),
  remove: (id: string) => api.delete(`/meetings/${id}`).then((r) => r.data),
  registerAttendance: (id: string) => api.post<void>(`/meetings/${id}/attendance`).then((r) => r.data),
  getAttendance: (id: string) => api.get(`/meetings/${id}/attendance`).then((r) => r.data),
};