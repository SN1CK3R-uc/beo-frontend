import { api } from './client';

export interface SummaryStats {
  activeMembers: number;
  memosReleased: number;
  meetingsHeld: number;
}

export const summaryApi = {
  get: () =>
    api.get<SummaryStats>('/summary').then((r) => r.data),
};