import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { useToast } from '@/hooks/useToast';
import { adminApi, type SystemPayment } from '@/api/admin.api';
import { formatMWK, formatDate } from '@/utils/format';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'failed';

export function AdminPaymentsTab() {
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [reVerifying, setReVerifying] = useState<string | null>(null);

  const toast = useToast();
  const queryClient = useQueryClient();

  const paymentsQuery = useQuery({
    queryKey: ['admin', 'payments', filter],
    queryFn: () =>
      adminApi.listAllPayments(filter === 'all' ? undefined : filter),
  });

  const reVerify = async (payment: SystemPayment) => {
    if (!payment.gatewayRef) {
      toast.error('Payment has no gateway reference.');
      return;
    }

    setReVerifying(payment.id);
    try {
      const res = await adminApi.reVerifyPayment(payment.gatewayRef);
      if (res.status === 'confirmed') {
        toast.success(`Payment confirmed: ${formatMWK(payment.amountMWK)}`);
      } else if (res.status === 'failed') {
        toast.error('Payment failed on the gateway.');
      } else {
        toast.warn('Still pending on the gateway.');
      }
      await queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      await queryClient.invalidateQueries({ queryKey: ['payments'] });
    } catch {
      toast.error('Could not verify payment.');
    } finally {
      setReVerifying(null);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'confirmed') return 'var(--success-green)';
    if (status === 'failed') return 'var(--danger-red)';
    return '#f0ad4e';
  };

  const totals = {
    confirmed:
      paymentsQuery.data
        ?.filter((p) => p.status === 'confirmed')
        .reduce((s, p) => s + p.amountMWK, 0) ?? 0,
    pending:
      paymentsQuery.data
        ?.filter((p) => p.status === 'pending')
        .reduce((s, p) => s + p.amountMWK, 0) ?? 0,
    failed: paymentsQuery.data?.filter((p) => p.status === 'failed').length ?? 0,
  };

  return (
    <div>
      <div className="sub-nav" style={{ marginBottom: 16 }}>
        {(['all', 'pending', 'confirmed', 'failed'] as StatusFilter[]).map((f) => (
          <button
            key={f}
            className={`sub-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {paymentsQuery.data && (
        <div className="quick-stats-grid" style={{ marginBottom: 20 }}>
          <div className="stat-card">
            <h3>Confirmed Total</h3>
            <p
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                marginTop: 8,
                color: 'var(--success-green)',
              }}
            >
              {formatMWK(totals.confirmed)}
            </p>
          </div>
          <div className="stat-card">
            <h3>Pending Total</h3>
            <p
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                marginTop: 8,
                color: '#f0ad4e',
              }}
            >
              {formatMWK(totals.pending)}
            </p>
          </div>
          <div className="stat-card">
            <h3>Failed Count</h3>
            <p
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                marginTop: 8,
                color: 'var(--danger-red)',
              }}
            >
              {totals.failed}
            </p>
          </div>
        </div>
      )}

      {paymentsQuery.isLoading ? (
        <StateBlock kind="loading" message="Loading payments…" />
      ) : paymentsQuery.isError ? (
        <StateBlock
          kind="error"
          message="Could not load payments."
          onRetry={() => paymentsQuery.refetch()}
        />
      ) : paymentsQuery.data?.length === 0 ? (
        <StateBlock kind="empty" message={`No ${filter === 'all' ? '' : filter} payments found.`} />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Member</th>
                <th>Role</th>
                <th>Purpose</th>
                <th>Amount</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(paymentsQuery.data ?? []).map((p) => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                    {p.gatewayRef ?? p.id.slice(0, 12)}
                  </td>
                  <td>{p.userName}</td>
                  <td style={{ fontSize: '0.78rem' }}>
                    {p.userRole.toUpperCase()}
                  </td>
                  <td>{p.purpose}</td>
                  <td>{formatMWK(p.amountMWK)}</td>
                  <td>{p.provider}</td>
                  <td>
                    <span
                      style={{
                        color: statusColor(p.status),
                        fontWeight: 600,
                        textTransform: 'capitalize',
                      }}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {formatDate(p.createdAt)}
                  </td>
                  <td>
                    {p.status === 'pending' && (
                      <Button
                        variant="secondary"
                        onClick={() => reVerify(p)}
                        disabled={reVerifying === p.id}
                      >
                        {reVerifying === p.id ? 'Checking…' : 'Re-verify'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
