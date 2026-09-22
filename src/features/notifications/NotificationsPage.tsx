import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StateBlock } from '@/components/ui/StateBlock';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { usePageTitle } from '@/hooks/usePageTitle';
import { notificationsApi } from '@/api/notifications.api';
import { useState } from 'react';

export function NotificationsPage() {
  usePageTitle('Notifications');
  const toast = useToast();
  const queryClient = useQueryClient();
  const [marking, setMarking] = useState<string | null>(null);

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
  });

  const markRead = async (id: string) => {
    setMarking(id);
    try {
      await notificationsApi.markRead(id);
      toast.success('Marked as read.');
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch {
      toast.error('Could not mark as read.');
    } finally {
      setMarking(null);
    }
  };

  return (
    <div>
      <h2>Notifications & Feeds</h2>

      <div className="video-card" style={{ marginTop: 20 }}>
        <h3>System Onboarding & Tutorial</h3>
        <iframe
          width="100%"
          height="280"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="Tutorial"
          frameBorder={0}
          allowFullScreen
          style={{ marginTop: 12, borderRadius: 8 }}
        />
      </div>

      <div className="feed-container" style={{ marginTop: 24 }}>
        <h3>User Promotions & Achievements</h3>

        {notificationsQuery.isLoading ? (
          <StateBlock kind="loading" message="Loading notifications…" />
        ) : notificationsQuery.isError ? (
          <StateBlock
            kind="error"
            message="Could not load notifications."
            onRetry={() => notificationsQuery.refetch()}
          />
        ) : notificationsQuery.data?.length === 0 ? (
          <StateBlock kind="empty" message="You're all caught up." />
        ) : (
          notificationsQuery.data.map((n) => (
            <div
              key={n.id}
              className="feed-item"
              style={{
                padding: 16,
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                opacity: n.read ? 0.6 : 1,
              }}
            >
              <div style={{ flex: 1 }}>
                <h4>{n.title}</h4>
                <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                  {n.body}
                </p>
                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    marginTop: 4,
                  }}
                >
                  {new Date(n.createdAt).toLocaleString('en-GB')}
                </p>
              </div>

              {!n.read && (
                <Button
                  variant="secondary"
                  onClick={() => markRead(n.id)}
                  disabled={marking === n.id}
                >
                  {marking === n.id ? '…' : 'Mark read'}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}