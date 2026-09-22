import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: number;
}

export function Modal({ open, onClose, title, children, width = 500 }: Props) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" style={{ display: 'flex' }} onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <span className="close-btn" onClick={onClose}>
            ×
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}