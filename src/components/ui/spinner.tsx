interface Props {
  size?: number;
  label?: string;
}

export function Spinner({ size = 20, label }: Props) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
      }}
    >
      <span
        style={{
          width: size,
          height: size,
          border: `2px solid var(--border-color)`,
          borderTopColor: 'var(--brand-color)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          display: 'inline-block',
        }}
      />
      {label && <span>{label}</span>}
    </div>
  );
}