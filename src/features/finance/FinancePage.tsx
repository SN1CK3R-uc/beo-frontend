import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { StateBlock } from '@/components/ui/StateBlock';
import { useToast } from '@/hooks/useToast';
import { useAuthStore } from '@/stores/authStore';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatBalance, formatMWK, formatDate } from '@/utils/format';
import { financeApi } from '@/api/finance.api';
import { pdfApi } from '@/api/pdf.api';
import { api } from '@/api/client';
import { PaymentModal } from './PaymentModal';

type SubTab = 'membership' | 'nomination' | 'affiliated';

interface Payment {
  id: string;
  purpose: string;
  amountMWK: number;
  provider: string;
  status: string;
  gatewayRef: string;
  createdAt: string;
}

const NOMINATION_FEES = [
  { position: 'CEO', feeMWK: 5000 },
  { position: 'Manager', feeMWK: 3500 },
  { position: 'Treasurer', feeMWK: 3000 },
];

const OTHER_FEES = [
  { description: 'Annual Tech Support', rateMWK: 5000, dueDate: '2026-12-31' },
  { description: 'Youth Development Fund', rateMWK: 2500, dueDate: '2026-10-15' },
];

export function FinancePage() {
  usePageTitle('Financials');

  const [tab, setTab] = useState<SubTab>('membership');
  const [payOpen, setPayOpen] = useState(false);
  const [payPurpose, setPayPurpose] = useState('');
  const [payAmount, setPayAmount] = useState<number | null>(null);

  const [downloadingTxn, setDownloadingTxn] = useState<string | null>(null);
  const [downloadingStatement, setDownloadingStatement] = useState(false);
  const [reVerifying, setReVerifying] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const toast = useToast();
  const queryClient = useQueryClient();

  const balanceQuery = useQuery({
    queryKey: ['balance'],
    queryFn: financeApi.getBalance,
  });

  const transactionsQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: financeApi.getTransactions,
  });

  const paymentsQuery = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get<Payment[]>('/payments').then((r) => r.data),
  });

  const pendingPayments =
    paymentsQuery.data?.filter((p) => p.status === 'pending') ?? [];

  const openPayment = (purpose: string, amount: number | null = null) => {
    setPayPurpose(purpose);
    setPayAmount(amount);
    setPayOpen(true);
  };

  const downloadReceipt = async (txnId: string) => {
    setDownloadingTxn(txnId);
    try {
      const { pdfId } = await pdfApi.issue('receipt', txnId);
      await pdfApi.download(pdfId);
      toast.success('Receipt downloaded.');
    } catch {
      toast.error('Could not download receipt.');
    } finally {
      setDownloadingTxn(null);
    }
  };

  const downloadStatement = async () => {
    if (!user) return;
    setDownloadingStatement(true);
    try {
      const { pdfId } = await pdfApi.issue('statement', user.id);
      await pdfApi.download(pdfId);
      toast.success('Statement downloaded.');
    } catch {
      toast.error('Could not generate statement.');
    } finally {
      setDownloadingStatement(false);
    }
  };

  const reVerifyPayment = async (txRef: string) => {
    setReVerifying(txRef);
    try {
      const res = await api.post<{ status: string }>('/payments/verify', {
        txRef,
      });
      if (res.data.status === 'confirmed') {
        toast.success('Payment confirmed.');
        await queryClient.invalidateQueries({ queryKey: ['balance'] });
        await queryClient.invalidateQueries({ queryKey: ['transactions'] });
        await queryClient.invalidateQueries({ queryKey: ['payments'] });
      } else {
        toast.warn('Still pending on PayChangu.');
      }
    } catch {
      toast.error('Could not verify payment.');
    } finally {
      setReVerifying(null);
    }
  };

  const membershipBalance = balanceQuery.data
    ? formatBalance(balanceQuery.data.amountMWK)
    : null;

  return (
    <div>
      <h2>Financials Management</h2>

      <div className="sub-nav">
        {(['membership', 'nomination', 'affiliated'] as SubTab[]).map((t) => (
          <button
            key={t}
            className={`sub-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'membership' && 'Membership Fee'}
            {t === 'nomination' && 'Nomination Fees'}
            {t === 'affiliated' && 'Affiliated & Other Fees'}
          </button>
        ))}
      </div>

      {tab === 'membership' && (
        <>
          <div className="balance-card">
            <h3>Current Membership Balance</h3>

            {balanceQuery.isLoading ? (
              <StateBlock kind="loading" />
            ) : balanceQuery.isError ? (
              <StateBlock
                kind="error"
                message="Could not load your balance."
                onRetry={() => balanceQuery.refetch()}
              />
            ) : (
              <>
                <div className={`balance-display-box ${membershipBalance?.className}`}>
                  {membershipBalance?.text}
                </div>
                <p
                  className="balance-legend"
                  style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}
                >
                  <span className="badge-red">Red = Balance Due</span> |{' '}
                  <span className="badge-blue">Blue = Cleared</span> |{' '}
                  <span className="badge-green">Green = Excess Credit</span>
                </p>
              </>
            )}

            <div className="fin-actions">
              <Button
                onClick={() => openPayment('Membership Balance Settlement')}
                disabled={balanceQuery.isLoading}
              >
                Pay Balance Now
              </Button>
              <Button
                variant="secondary"
                onClick={downloadStatement}
                disabled={downloadingStatement || balanceQuery.isLoading}
              >
                {downloadingStatement ? 'Generating…' : 'Download Statement (PDF)'}
              </Button>
            </div>
          </div>

          {pendingPayments.length > 0 && (
            <div className="receipts-container" style={{ marginTop: 24 }}>
              <h3>Pending Payments</h3>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  marginBottom: 8,
                }}
              >
                These payments were initiated but not yet confirmed.
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Amount</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingPayments.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                          {p.gatewayRef}
                        </td>
                        <td>{formatMWK(p.amountMWK)}</td>
                        <td>{formatDate(p.createdAt)}</td>
                        <td>
                          <Button
                            variant="secondary"
                            onClick={() => reVerifyPayment(p.gatewayRef)}
                            disabled={reVerifying === p.gatewayRef}
                          >
                            {reVerifying === p.gatewayRef ? 'Checking…' : 'Re-verify'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="receipts-container" style={{ marginTop: 24 }}>
            <h3>Payment History & Digital Receipts</h3>

            {transactionsQuery.isLoading ? (
              <StateBlock kind="loading" message="Loading transactions…" />
            ) : transactionsQuery.isError ? (
              <StateBlock
                kind="error"
                message="Could not load transactions."
                onRetry={() => transactionsQuery.refetch()}
              />
            ) : transactionsQuery.data?.length === 0 ? (
              <StateBlock
                kind="empty"
                message="No transactions yet."
                action={
                  <Button onClick={() => openPayment('Membership Balance Settlement')}>
                    Make your first payment
                  </Button>
                }
              />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Channel</th>
                      <th>Purpose</th>
                      <th>Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionsQuery.data.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                          {r.id.slice(0, 12)}…
                        </td>
                        <td>{formatDate(r.date)}</td>
                        <td>{formatMWK(r.amountMWK)}</td>
                        <td>{r.channel}</td>
                        <td>{r.purpose}</td>
                        <td>
                          <Button
                            variant="secondary"
                            onClick={() => downloadReceipt(r.id)}
                            disabled={downloadingTxn === r.id}
                          >
                            {downloadingTxn === r.id ? 'Generating…' : 'PDF'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'nomination' && (
        <>
          <h3 style={{ marginTop: 16, marginBottom: 8 }}>
            Campaign & Nomination Fee Structure
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th>Nomination Fee</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {NOMINATION_FEES.map((f) => (
                  <tr key={f.position}>
                    <td>{f.position}</td>
                    <td>{formatMWK(f.feeMWK)}</td>
                    <td>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          openPayment(`${f.position} Nomination Fee`, f.feeMWK)
                        }
                      >
                        Pay Fee
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'affiliated' && (
        <>
          <h3 style={{ marginTop: 16, marginBottom: 8 }}>
            Affiliated & Institutional Fees
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fee Description</th>
                  <th>Standard Rate</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {OTHER_FEES.map((f) => (
                  <tr key={f.description}>
                    <td>{f.description}</td>
                    <td>{formatMWK(f.rateMWK)}</td>
                    <td>{formatDate(f.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        purpose={payPurpose}
        amount={payAmount}
      />
    </div>
  );
}