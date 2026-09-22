import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useToast } from '@/hooks/useToast';

/**
 * Detects when the user returns from PayChangu (via ?tx_ref=... in the URL),
 * verifies the payment server-side, invalidates cached queries, and shows
 * the appropriate toast. Cleans the URL afterwards so a refresh doesn't
 * re-trigger verification.
 */
export function usePayChanguReturn() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();

  // Guard against React StrictMode double-invoking the effect in dev
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;

    const txRef = searchParams.get('tx_ref');
    if (!txRef) return;

    ran.current = true;

    // Clean the URL immediately so refreshes don't re-verify
    setSearchParams({}, { replace: true });

    (async () => {
      try {
        const res = await api.post<{ status: string; alreadyProcessed?: boolean }>(
          '/payments/verify',
          { txRef },
        );

        if (res.data.status === 'confirmed') {
          toast.success(
            res.data.alreadyProcessed
              ? 'Payment was already confirmed.'
              : 'Payment confirmed! Your balance has been updated.',
          );

          // Refresh balance + transaction lists everywhere
          await queryClient.invalidateQueries({ queryKey: ['balance'] });
          await queryClient.invalidateQueries({ queryKey: ['transactions'] });
        } else if (res.data.status === 'failed') {
          toast.error('Payment failed. No amount was charged.');
        } else {
          toast.warn(
            'Payment still pending. Please wait a moment and refresh.',
          );
        }
      } catch (err) {
        console.error('[paychangu return]', err);
        toast.error('Could not verify payment. Contact support if charged.');
      } finally {
        sessionStorage.removeItem('pending_payment_tx_ref');
        sessionStorage.removeItem('pending_payment_amount');
      }
    })();
  }, [searchParams, setSearchParams, queryClient, toast]);
}