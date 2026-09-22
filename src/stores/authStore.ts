import { create } from 'zustand';
import type { User } from '@/types/models';
import { api } from '@/api/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (userId: string, passKey: string) => Promise<void>;
  logout: () => Promise<void>;
  bootstrap: () => Promise<void>;
  updateProfile: (
    patch: Partial<User> & { newPassKey?: string },
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  login: async (userId, passKey) => {
    const { data } = await api.post<User>('/auth/login', { userId, passKey });
    set({ user: data, isLoading: false });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* swallow — the user is logging out either way */
    }
    set({ user: null });
  },

  bootstrap: async () => {
    try {
      const { data } = await api.get<User>('/auth/me');
      set({ user: data });
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (patch) => {
    const { data } = await api.patch<User>('/me', patch);
    set({ user: data });
  },
}));