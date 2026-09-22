import { api } from './client';
import type { Balance, Transaction } from '@/types/models';

export const financeApi = {
  getBalance: () =>
    api.get<Balance>('/me/balance').then((r) => r.data),

  getTransactions: () =>
    api.get<Transaction[]>('/me/transactions').then((r) => r.data),

  initiatePayment: (payload: {
    purpose: string;
    amountMWK: number;
    provider: string;
    phone: string;
  }) =>
    api
      .post<{ paymentId: string; redirectUrl?: string }>(
        '/payments/initiate',
        payload,
      )
      .then((r) => r.data),
};