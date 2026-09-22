import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'facebook';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...rest
}: Props) {
  const variantClass = {
    primary: 'action-btn',
    secondary: 'secondary-btn',
    danger: 'sidebar-logout-btn',
    facebook: 'share-btn',
  }[variant];

  return (
    <button className={`${variantClass} ${className}`} {...rest}>
      {children}
    </button>
  );
}