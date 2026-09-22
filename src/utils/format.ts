export function formatMWK(amount: number): string {
  const abs = Math.abs(amount).toFixed(2);
  return `MWK${abs}`;
}

export function formatBalance(amount: number): {
  text: string;
  className: string;
} {
  if (amount > 0) return { text: `Due: ${formatMWK(amount)}`, className: 'balance-red' };
  if (amount < 0) return { text: `Credit: ${formatMWK(amount)}`, className: 'balance-green' };
  return { text: 'MWK0.00 (Cleared)', className: 'balance-blue' };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}