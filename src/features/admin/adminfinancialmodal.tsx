import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { usersApi } from '@/api/users.api';

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  onSuccess: () => void;
}

export function AdminFinancialModal({ open, onClose, userId, onSuccess }: Props) {
  const toast = useToast();
  const [balanceMWK, setBalanceMWK] = useState(0);
  const [reason, setReason] = useState('');

  const userQuery = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => usersApi.get(userId!),
    enabled: !!userId && open,
  });

  useEffect(() => {
    if (open && userQuery.data) {
      setBalanceMWK(userQuery.data.balanceMWK);
      setReason('');
    }
  }, [open, userQuery.data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Reason is required.');
      return;
    }
    try {
      await usersApi.updateFinancial(userId!, balanceMWK, reason);
      toast.success('Balance updated.');
      onSuccess();
      onClose();
    } catch {
      toast.error('Could not update balance.');
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Adjust Financial Balance">
      {userQuery.isLoading ? (
        <p>Loading…</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <p style={{ marginBottom: 16 }}>
            <strong>{userQuery.data?.name}</strong> — current balance:{' '}
            {userQuery.data?.balanceMWK} MWK
          </p>

          <div className="form-group">
            <label>New Balance (MWK):</label>
            <input
              type="number"
              value={balanceMWK}
              onChange={(e) => setBalanceMWK(Number(e.target.value))}
              required
            />
            <small style={{ color: 'var(--text-muted)' }}>
              Positive = owes money. Negative = has credit. Zero = cleared.
            </small>
          </div>

          <div className="form-group">
            <label>Reason:</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Annual fee adjustment"
              required
            />
          </div>

          <div className="modal-footer" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Update Balance</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}