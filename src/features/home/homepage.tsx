import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { useAuthStore } from '@/stores/authStore';
import { usePageTitle } from '@/hooks/usePageTitle';
import { usePermissions } from '@/hooks/usePermissions';
import { formatBalance } from '@/utils/format';
import { financeApi } from '@/api/finance.api';
import { meetingsApi } from '@/api/meetings.api';
import { notificationsApi } from '@/api/notifications.api';
import { AnnouncementSlider } from './AnnouncementSlider';
import { CreateAnnouncementModal } from './CreateAnnouncementModal';

export function HomePage() {
  usePageTitle('Home');
  const user = useAuthStore((s) => s.user);
  const { can } = usePermissions();
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);

  const balanceQuery = useQuery({ queryKey: ['balance'], queryFn: financeApi.getBalance });
  const meetingsQuery = useQuery({ queryKey: ['meetings'], queryFn: meetingsApi.list });
  const notificationsQuery = useQuery({ queryKey: ['notifications'], queryFn: notificationsApi.list });

  const balance = balanceQuery.data ? formatBalance(balanceQuery.data.amountMWK) : null;

  return (
    <div>
      <div className="home-header">
        <div>
          <h2 style={{ marginBottom: 4 }}>Welcome back, {user?.name}</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {can('announcements.publish') && (
          <Button onClick={() => setAnnouncementModalOpen(true)}>
            + New Announcement
          </Button>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        <AnnouncementSlider />
      </div>

      <div className="quick-stats-grid" style={{ marginTop: 24 }}>
        <Card>
          <h3>My Balance</h3>
          {balanceQuery.isLoading ? <StateBlock kind="loading" /> : balanceQuery.isError ? (
            <p style={{ color: 'var(--danger-red)', fontSize: '0.85rem' }}>Could not load</p>
          ) : (
            <div className={`balance-amount ${balance?.className}`} style={{ fontSize: '1.6rem', fontWeight: 700, marginTop: 8 }}>
              {balance?.text}
            </div>
          )}
        </Card>

        <Card>
          <h3>Upcoming Meetings</h3>
          {meetingsQuery.isLoading ? <StateBlock kind="loading" /> : meetingsQuery.isError ? (
            <p style={{ color: 'var(--danger-red)', fontSize: '0.85rem' }}>Could not load</p>
          ) : (
            <p style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 8 }}>
              {meetingsQuery.data?.filter((m) => !m.cancelled).length ?? 0} Scheduled
            </p>
          )}
        </Card>

        <Card>
          <h3>Active Notifications</h3>
          {notificationsQuery.isLoading ? <StateBlock kind="loading" /> : notificationsQuery.isError ? (
            <p style={{ color: 'var(--danger-red)', fontSize: '0.85rem' }}>Could not load</p>
          ) : (
            <p style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: 8 }}>
              {notificationsQuery.data?.filter((n) => !n.read).length ?? 0} Unread
            </p>
          )}
        </Card>
      </div>

      <CreateAnnouncementModal
        open={announcementModalOpen}
        onClose={() => setAnnouncementModalOpen(false)}
      />
    </div>
  );
}