import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { api } from '@/api/client';

interface Props {
  open: boolean;
  onClose: () => void;
  purpose: string;
  amount: number | null;
}

type Phase = 'form' | 'awaiting';

export function PaymentModal({ open, onClose, purpose, amount }: Props) {
  const [phase, setPhase] = useState<Phase>('form');
  const [loading, setLoading] = useState(false);
  const [txRef, setTxRef] = useState<string | null>(null);

  const [form, setForm] = useState({ amount: '', phone: '' });

  const toast = useToast();
  const queryClient = useQueryClient();

  // Reset when the modal opens with a new amount/purpose
  useEffect(() => {
    if (open) {
      setPhase('form');
      setTxRef(null);
      setLoading(false);
      setForm({
        amount: amount !== null ? String(amount) : '',
        phone: '',
      });
    }
  }, [amount, open]);

  // Auto-poll for confirmation while awaiting
  useEffect(() => {
    if (phase !== 'awaiting' || !txRef) return;

    let cancelled = false;

    const interval = setInterval(async () => {
      if (cancelled) return;
      try {
        const res = await api.post<{ status: string }>(
          '/payments/verify',
          { txRef },
        );

        if (cancelled) return;

        if (res.data.status === 'confirmed') {
          clearInterval(interval);
          toast.success('Payment confirmed! Balance updated.');
          await queryClient.invalidateQueries({ queryKey: ['balance'] });
          await queryClient.invalidateQueries({ queryKey: ['transactions'] });
          await queryClient.invalidateQueries({ queryKey: ['payments'] });
          setPhase('form');
          setTxRef(null);
          onClose();
        }
        // else: still pending, keep polling
      } catch (err) {
        // Silent — user might not have finished paying yet
        console.log('[auto-verify]', err);
      }
    }, 4000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [phase, txRef, queryClient, toast, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const value = parseFloat(form.amount);
    if (!value || value <= 0) {
      toast.error('Enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{
        paymentId: string;
        txRef: string;
        checkoutUrl: string;
      }>('/payments/initiate', {
        purpose,
        amountMWK: value,
        provider: 'PayChangu',
        phone: form.phone || undefined,
      });

      setTxRef(res.data.txRef);
      setPhase('awaiting');
      setLoading(false);

      // Open checkout in a new tab. Current tab stays on /financials.
      window.open(res.data.checkoutUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('[payments initiate]', err);
      toast.error('Could not initiate payment. Please try again.');
      setLoading(false);
    }
  };

  const handleManualVerify = async () => {
    if (!txRef) return;
    try {
      const res = await api.post<{ status: string }>(
        '/payments/verify',
        { txRef },
      );

      if (res.data.status === 'confirmed') {
        toast.success('Payment confirmed!');
        await queryClient.invalidateQueries({ queryKey: ['balance'] });
        await queryClient.invalidateQueries({ queryKey: ['transactions'] });
        await queryClient.invalidateQueries({ queryKey: ['payments'] });
        setPhase('form');
        setTxRef(null);
        onClose();
      } else if (res.data.status === 'failed') {
        toast.error('Payment failed.');
      } else {
        toast.warn('Still pending. Finish paying in the PayChangu tab, then try again.');
      }
    } catch {
      toast.error('Could not verify. Try again in a moment.');
    }
  };

  const handleCancel = () => {
    setPhase('form');
    setTxRef(null);
    setLoading(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel} title="Pay with PayChangu">
      {phase === 'form' && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Payment Purpose:</label>
            <input type="text" value={purpose} readOnly />
          </div>

          <div className="form-group">
            <label>Amount (MWK):</label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone (optional):</label>
            <input
              type="tel"
              placeholder="+265 99X XXX XXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            A new tab opens with PayChangu's checkout page. Pay there, then come
            back to this modal. It will auto-verify.
          </p>

          <div
            className="modal-footer"
            style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}
          >
            <Button
              variant="secondary"
              type="button"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Opening…' : 'Open PayChangu'}
            </Button>
          </div>
        </form>
      )}

      {phase === 'awaiting' && (
        <div>
          <div
            style={{
              padding: 16,
              background: 'var(--bg-hover)',
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
              Waiting for payment…
            </p>
            <p
              style={{
                margin: '8px 0 0',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
              }}
            >
              Reference: <code>{txRef}</code>
            </p>
          </div>

          <p style={{ fontSize: '0.9rem' }}>
            Complete the payment in the PayChangu tab. This modal will update
            automatically once it's confirmed.
          </p>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 8 }}>
            If it doesn't update within a minute, click <strong>Verify Now</strong>.
          </p>

          <div
            className="modal-footer"
            style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}
          >
            <Button variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleManualVerify}>Verify Now</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}