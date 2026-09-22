import { api } from './client';
import type { User, Role } from '@/types/models';

export interface AdminUser extends User {
  balanceMWK: number;
  isActive: boolean;
}

export const usersApi = {
  list: () => api.get<AdminUser[]>('/users').then((r) => r.data),

  get: (id: string) => api.get<AdminUser>(`/users/${id}`).then((r) => r.data),

  create: (payload: {
    id: string;
    name: string;
    role: Role;
    sex: 'Male' | 'Female';
    dob: string;
    email: string;
    phone: string;
    passKey: string;
    balanceMWK?: number;
  }) => api.post<AdminUser>('/users', payload).then((r) => r.data),

  update: (id: string, patch: Partial<AdminUser> & { newPassKey?: string }) =>
    api.patch<AdminUser>(`/users/${id}`, patch).then((r) => r.data),

  updateFinancial: (id: string, balanceMWK: number, reason: string) =>
    api
      .patch<AdminUser>(`/users/${id}/financial`, { balanceMWK, reason })
      .then((r) => r.data),

  deactivate: (id: string) =>
    api.patch(`/users/${id}/deactivate`).then((r) => r.data),

  reactivate: (id: string) =>
    api.patch(`/users/${id}/reactivate`).then((r) => r.data),
};