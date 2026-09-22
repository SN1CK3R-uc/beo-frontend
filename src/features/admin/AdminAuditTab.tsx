import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StateBlock } from '@/components/ui/StateBlock';
import { adminApi, type AuditEntry } from '@/api/admin.api';

const ACTION_LABELS: Record<string, string> = {
  'auth.login': '🔓 Login',
  'auth.logout': '🚪 Logout',
  'auth.password_reset': '🔑 Password Reset',
  'me.profile.update': '👤 Profile Updated',
  'users.create': '👥 User Created',
  'users.update': '✏️ User Updated',
  'users.financial.adjust': '💰 Balance Adjusted',
  'users.deactivate': '⛔ User Suspended',
  'users.reactivate': '✅ User Reactivated',
  'memos.publish': '📝 Memo Published',
  'memos.delete': '🗑️ Memo Deleted',
  'meetings.create': '📅 Meeting Created',
  'meetings.update': '📅 Meeting Updated',
  'meetings.delete': '🗑️ Meeting Deleted',
  'announcements.create': '📢 Announcement Published',
  'announcements.delete': '🗑️ Announcement Deleted',
  'finance.payment.confirmed': '💳 Payment Confirmed',
};

const ACTION_CATEGORIES: Record<string, string> = {
  'auth': 'Auth',
  'me': 'Profile',
  'users': 'Users',
  'memos': 'Memos',
  'meetings': 'Meetings',
  'announcements': 'Announcements',
  'finance': 'Finance',
};

function categoryOf(action: string): string {
  const prefix = action.split('.')[0] ?? '';
  return ACTION_CATEGORIES[prefix] ?? 'Other';
}

export function AdminAuditTab() {
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const auditQuery = useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: () => adminApi.listAudit(200),
    refetchInterval: 30_000, // auto-refresh every 30s
  });

  const filtered = (auditQuery.data ?? []).filter((entry) => {
    if (category !== 'all' && categoryOf(entry.action) !== category) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const haystack = [
        entry.actorName,
        entry.action,
        entry.details ?? '',
        entry.target ?? '',
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const categories = ['all', 'Auth', 'Users', 'Finance', 'Memos', 'Meetings', 'Announcements', 'Profile'];

  return (
    <div>
      <div className="sub-nav" style={{ marginBottom: 12, flexWrap: 'wrap' }}>
        {categories.map((c) => (
          <button
            key={c}
            className={`sub-btn ${category === c ? 'active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      <div className="form-group" style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search by actor, action, or details…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {auditQuery.isLoading ? (
        <StateBlock kind="loading" message="Loading audit log…" />
      ) : auditQuery.isError ? (
        <StateBlock
          kind="error"
          message="Could not load audit log."
          onRetry={() => auditQuery.refetch()}
        />
      ) : filtered.length === 0 ? (
        <StateBlock kind="empty" message="No matching audit entries." />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Target</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {new Date(e.createdAt).toLocaleString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{e.actorName}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {ACTION_LABELS[e.action] ?? e.action}
                  </td>
                  <td
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.78rem',
                    }}
                  >
                    {e.target ?? '—'}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {e.details ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p
        style={{
          marginTop: 12,
          fontSize: '0.78rem',
          color: 'var(--text-muted)',
          textAlign: 'right',
        }}
      >
        Showing {filtered.length} of {auditQuery.data?.length ?? 0} entries ·
        Auto-refreshes every 30s
      </p>
    </div>
  );
}