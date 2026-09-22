import { useToastStore } from '@/stores/toastStore';

export function useToast() {
  const push = useToastStore((s) => s.push);
  return {
    info: (m: string) => push(m, 'info'),
    success: (m: string) => push(m, 'success'),
    error: (m: string) => push(m, 'danger'),
    warn: (m: string) => push(m, 'warn'),
  };
}