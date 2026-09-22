import { api } from './client';

export interface SystemPayment {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  purpose: string;
  amountMWK: number;
  provider: string;
  phone: string;
  status: 'pending' | 'confirmed' | 'failed';
  gatewayRef: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  id: string;
  actorId: string | null;
  actorName: string;
  action: string;
  target: string | null;
  details: string | null;
  createdAt: string;
}

export const adminApi = {
  listAllPayments: (status?: string, limit = 200) => {
    const qs = new URLSearchParams();
    if (status) qs.set('status', status);
    qs.set('limit', String(limit));
    return api
      .get<SystemPayment[]>(`/payments/all?${qs.toString()}`)
      .then((r) => r.data);
  },

  reVerifyPayment: (txRef: string) =>
    api
      .post<{ status: string }>('/payments/verify', { txRef })
      .then((r) => r.data),

  listAudit: (limit = 100) =>
    api.get<AuditEntry[]>(`/audit?limit=${limit}`).then((r) => r.data),
};