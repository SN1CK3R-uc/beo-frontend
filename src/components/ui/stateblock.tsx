import type { ReactNode } from 'react';
import { Button } from './Button';
import { Spinner } from './Spinner';

interface Props {
  kind: 'loading' | 'error' | 'empty';
  message?: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export function StateBlock({ kind, message, onRetry, action }: Props) {
  if (kind === 'loading') {
    return (
      <div
        style={{
          padding: 40,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 120,
        }}
      >
        <Spinner size={24} label={message ?? 'Loading…'} />
      </div>
    );
  }

  if (kind === 'error') {
    return (
      <div
        style={{
          padding: 32,
          textAlign: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 10,
        }}
      >
        <p style={{ color: 'var(--danger-red)', marginBottom: 12 }}>
          {message ?? 'Something went wrong.'}
        </p>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  // empty
  return (
    <div
      style={{
        padding: 40,
        textAlign: 'center',
        background: 'var(--bg-surface)',
        border: '1px dashed var(--border-color)',
        borderRadius: 10,
        color: 'var(--text-muted)',
      }}
    >
      <p style={{ marginBottom: action ? 16 : 0 }}>
        {message ?? 'Nothing here yet.'}
      </p>
      {action}
    </div>
  );
}