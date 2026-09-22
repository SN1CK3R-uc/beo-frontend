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
    const url: string = error.config?.url ?? '';

    // Endpoints that should never trigger an auto-logout:
    // - /auth/logout: calling it while already logged out returns 401
    // - /auth/me: initial session check on page load, expected to 401 when not logged in
    const isLogoutCall = url.includes('/auth/logout');
    const isMeCall = url.includes('/auth/me');

    if (status === 401 && !isLogoutCall && !isMeCall) {
      // Session expired while the user was active — log them out once
      useAuthStore.getState().logout();
    }

    if (status === 403) {
      useToastStore
        .getState()
        .push('You do not have permission for that action.', 'danger');
    }

    if (status && status >= 500) {
      useToastStore
        .getState()
        .push('Server error. Please try again.', 'danger');
    }

    if (!error.response) {
      useToastStore
        .getState()
        .push('Network error. Check your connection.', 'danger');
    }

    return Promise.reject(error);
  },
);
