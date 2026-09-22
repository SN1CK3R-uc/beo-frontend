import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { useToast } from '@/hooks/useToast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { usePermissions } from '@/hooks/usePermissions';
import { memosApi, type Memo } from '@/api/memos.api';
import { MemoComposerModal } from './MemoComposerModal';
import { MemoDetailModal } from './MemoDetailModal';

export function MemosPage() {
  usePageTitle('Memos');

  const { can } = usePermissions();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [composerOpen, setComposerOpen] = useState(false);
  const [activeMemo, setActiveMemo] = useState<Memo | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const memosQuery = useQuery({
    queryKey: ['memos'],
    queryFn: memosApi.list,
    refetchOnMount: 'always',
  });

  const openMemo = (memo: Memo) => {
    setActiveMemo(memo);
    // Optimistically mark as read in the cache
    queryClient.setQueryData<Memo[]>(['memos'], (old) =>
      old?.map((m) => (m.id === memo.id ? { ...m, hasRead: true } : m)),
    );
  };

  const deleteMemo = async (memo: Memo) => {
    if (!confirm(`Delete memo "${memo.subject}"? This cannot be undone.`)) return;
    setDeletingId(memo.id);
    try {
      await memosApi.remove(memo.id);
      toast.success('Memo deleted.');
      await queryClient.invalidateQueries({ queryKey: ['memos'] });
    } catch {
      toast.error('Could not delete memo.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="home-header">
        <h2>Memos</h2>
        {can('memos.publish') && (
          <Button onClick={() => setComposerOpen(true)}>+ Compose Memo</Button>
        )}
      </div>

      {memosQuery.isLoading ? (
        <StateBlock kind="loading" message="Loading memos…" />
      ) : memosQuery.isError ? (
        <StateBlock
          kind="error"
          message="Could not load memos."
          onRetry={() => memosQuery.refetch()}
        />
      ) : memosQuery.data?.length === 0 ? (
        <StateBlock
          kind="empty"
          message="No memos have been published yet."
          action={
            can('memos.publish') ? (
              <Button onClick={() => setComposerOpen(true)}>
                Compose the first one
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="memo-list">
          {(memosQuery.data ?? []).map((m) => {
            const percent =
              m.totalRecipients > 0
                ? Math.round((m.readCount / m.totalRecipients) * 100)
                : 0;

            return (
              <div
                key={m.id}
                className={`memo-list-item ${m.hasRead ? '' : 'unread'}`}
              >
                <div
                  className="memo-list-main"
                  onClick={() => openMemo(m)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="memo-list-header">
                    {!m.hasRead && <span className="memo-unread-dot" />}
                    <h3 className="memo-list-subject">{m.subject}</h3>
                  </div>
                  <p className="memo-list-meta">
                    <strong>To:</strong> {m.to} &nbsp;·&nbsp;{' '}
                    <strong>From:</strong> {m.from} &nbsp;·&nbsp;{' '}
                    {new Date(m.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="memo-list-preview">
                    {m.body.length > 160 ? m.body.slice(0, 160) + '…' : m.body}
                  </p>
                  <div className="memo-list-stats">
                    <span>
                      Read by {m.readCount} / {m.totalRecipients} ({percent}%)
                    </span>
                  </div>
                </div>

                {can('memos.delete') && (
                  <div className="memo-list-actions">
                    <Button
                      variant="secondary"
                      onClick={() => deleteMemo(m)}
                      disabled={deletingId === m.id}
                    >
                      {deletingId === m.id ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <MemoComposerModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
      />

      <MemoDetailModal memo={activeMemo} onClose={() => setActiveMemo(null)} />
    </div>
  );
}
