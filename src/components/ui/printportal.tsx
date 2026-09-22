import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

/**
 * Wrap content that should only appear when printing.
 * Rendered off-screen normally; becomes the only visible
 * element during print because of the .print-area CSS rule.
 */
export function PrintPortal({ children }: Props) {
  return <div className="print-area">{children}</div>;
}