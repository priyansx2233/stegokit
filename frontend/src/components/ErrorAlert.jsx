/**
 * ErrorAlert — displays an API or validation error message.
 */
export default function ErrorAlert({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div className="fade-up" style={{
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.25)',
      borderRadius: 12, padding: '14px 16px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>Error</div>
        <div style={{ fontSize: 13, color: '#fca5a5', lineHeight: 1.5 }}>{error}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8888a8', fontSize: 16, padding: 0 }}
        >✕</button>
      )}
    </div>
  );
}
