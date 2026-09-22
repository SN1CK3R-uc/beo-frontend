import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePageTitle } from '@/hooks/usePageTitle';
import { usersApi } from '@/api/users.api';
import { StateBlock } from '@/components/ui/StateBlock';
import { Button } from '@/components/ui/Button';
import { formatMWK } from '@/utils/format';
import { AdminUserModal } from './AdminUserModal';
import { AdminFinancialModal } from './AdminFinancialModal';
import { AdminPaymentsTab } from './AdminPaymentsTab';
import { AdminAuditTab } from './AdminAuditTab';

type AdminTab = 'users' | 'payments' | 'audit';

export function AdminPage() {
  usePageTitle('Admin');
  const [tab, setTab] = useState<AdminTab>('users');
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [finUserId, setFinUserId] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: usersApi.list,
  });

  return (
    <div>
      <h2>Administration</h2>

      <div className="sub-nav">
        <button
          className={`sub-btn ${tab === 'users' ? 'active' : ''}`}
          onClick={() => setTab('users')}
        >
          Users
        </button>
        <button
          className={`sub-btn ${tab === 'payments' ? 'active' : ''}`}
          onClick={() => setTab('payments')}
        >
          Payments
        </button>
        <button
          className={`sub-btn ${tab === 'audit' ? 'active' : ''}`}
          onClick={() => setTab('audit')}
        >
          Audit Log
        </button>
      </div>

      {tab === 'users' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <Button onClick={() => { setEditUserId(null); setUserModalOpen(true); }}>
              + Add User
            </Button>
          </div>

          {usersQuery.isLoading ? (
            <StateBlock kind="loading" />
          ) : usersQuery.isError ? (
            <StateBlock kind="error" message="Could not load users." onRetry={() => usersQuery.refetch()} />
          ) : usersQuery.data?.length === 0 ? (
            <StateBlock kind="empty" message="No users yet." />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersQuery.data.map((u) => (
                    <tr key={u.id} style={{ opacity: u.isActive ? 1 : 0.5 }}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.role.toUpperCase()}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>{formatMWK(u.balanceMWK)}</td>
                      <td>
                        {u.isActive ? (
                          <span style={{ color: 'var(--success-green)' }}>Active</span>
                        ) : (
                          <span style={{ color: 'var(--danger-red)' }}>Suspended</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <Button variant="secondary" onClick={() => { setEditUserId(u.id); setUserModalOpen(true); }}>
                            Edit
                          </Button>
                          <Button variant="secondary" onClick={() => setFinUserId(u.id)}>
                            Balance
                          </Button>
                          {u.isActive ? (
                            <Button
                              variant="secondary"
                              onClick={async () => {
                                if (confirm(`Suspend ${u.name}?`)) {
                                  await usersApi.deactivate(u.id);
                                  usersQuery.refetch();
                                }
                              }}
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              onClick={async () => {
                                await usersApi.reactivate(u.id);
                                usersQuery.refetch();
                              }}
                            >
                              Reactivate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'payments' && <AdminPaymentsTab />}

      {tab === 'audit' && <AdminAuditTab />}

      <AdminUserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        editUserId={editUserId}
        onSuccess={() => usersQuery.refetch()}
      />

      <AdminFinancialModal
        open={!!finUserId}
        onClose={() => setFinUserId(null)}
        userId={finUserId}
        onSuccess={() => usersQuery.refetch()}
      />
    </div>
  );
}