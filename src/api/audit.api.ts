import { api } from './client';

export interface AuditEntry {
  id: string;
  actorId: string | null;
  actorName: string;
  action: string;
  target: string | null;
  details: string | null;
  createdAt: string;
}

export const auditApi = {
  list: (limit = 100) =>
    api.get<AuditEntry[]>(`/audit?limit=${limit}`).then((r) => r.data),
};