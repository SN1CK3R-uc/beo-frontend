import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { useToastStore } from '@/stores/toastStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  withCredentials: true,
  timeout: 20_000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // 401: session expired or never existed
    if (status === 401) {
      useAuthStore.getState().logout();
    }

    // 403: forbidden — server says no
    if (status === 403) {
      useToastStore.getState().push(
        'You do not have permission for that action.',
        'danger',
      );
    }

    // 5xx: server-side error
    if (status && status >= 500) {
      useToastStore.getState().push(
        'Server error. Please try again.',
        'danger',
      );
    }

    // Network error (no response at all)
    if (!error.response) {
      useToastStore.getState().push(
        'Network error. Check your connection.',
        'danger',
      );
    }

    return Promise.reject(error);
  },
);