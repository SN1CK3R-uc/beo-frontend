import { useAuthStore } from '@/stores/authStore';
import type { Role } from '@/types/models';

const PERMISSIONS: Record<string, Role[]> = {
  'users.list':             ['ceo', 'manager', 'ict'],
  'users.read':             ['ceo', 'manager', 'ict'],
  'users.update.profile':   ['ceo', 'manager', 'treasurer', 'secretary', 'ict'],
  'users.update.financial': ['ceo', 'manager', 'treasurer', 'ict'],
  'users.create':           ['ceo', 'manager', 'ict'],
  'users.deactivate':       ['ceo', 'manager', 'ict'],
  'users.delete':           ['ceo','ict'],

  'finance.read.all':       ['ceo', 'manager', 'treasurer', 'ict'],
  'finance.adjust':         ['ceo', 'manager', 'treasurer', 'ict'],

  'memos.publish':          ['ceo', 'manager', 'treasurer', 'secretary', 'ict'],
  'memos.delete':           ['ceo', 'manager', 'ict'],

  'meetings.manage':        ['ceo', 'manager', 'secretary', 'ict'],

  'announcements.publish':  ['ceo', 'manager', 'treasurer', 'secretary', 'ict'],

  'admin.access':           ['ceo', 'manager', 'ict'],
  'audit.view':             ['ceo', 'manager', 'ict'],
};

export function usePermissions() {
  const role = useAuthStore((s) => s.user?.role);

  return {
    role,
    can: (permission: string) => {
      if (!role) return false;
      return PERMISSIONS[permission]?.includes(role) ?? false;
    },
  };
}