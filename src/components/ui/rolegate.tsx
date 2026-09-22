import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface Props {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ permission, children, fallback = null }: Props) {
  const { can } = usePermissions();
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}