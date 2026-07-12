const sw = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function ProductIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...sw}>
      <path d="M8 5l4-2 4 2 4 3-2 3-2-1v11H6V10L4 11 2 8z" />
    </svg>
  );
}

export function ColorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...sw}>
      <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...sw}>
      <rect x="3" y="4" width="14" height="14" rx="2" />
      <circle cx="8" cy="9" r="1.5" fill="currentColor" stroke="none" />
      <path d="M3 15l4-4 4 4 3-3 3 3" />
      <circle cx="19" cy="6" r="3.2" fill="#fff" />
      <path d="M19 4.4v3.2M17.4 6h3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function PrintIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...sw}>
      <path d="M6 9V4h12v5" />
      <rect x="3" y="9" width="18" height="8" rx="2" />
      <rect x="7" y="14" width="10" height="6" rx="1" />
      <circle cx="17" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function EffectsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...sw}>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" fill="currentColor" stroke="none" />
      <path d="M19 14l.7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8-1.8-.7 1.8-.7z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BuyIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" {...sw}>
      <path d="M5 7h14l-1.4 9.2a2 2 0 01-2 1.8h-7.2a2 2 0 01-2-1.8z" />
      <path d="M9 7V5a3 3 0 016 0v2" />
    </svg>
  );
}
