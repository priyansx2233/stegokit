
export default function ErrorAlert({ error, onDismiss }) {
  if (!error) return null;
  return (
    <div className="fade-up" style={{
      background: 'rgba(255,77,77,0.07)',
      border: '1px solid rgba(255,77,77,0.2)',
      borderRadius: 8,
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 16,
    }}>
      <div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          color: '#ff4d4d',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}>
          Error
        </div>
        <div style={{ fontSize: 13, color: '#ffa198', lineHeight: 1.5 }}>{error}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.3)',
            fontSize: 18,
            padding: 0,
            lineHeight: 1,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
        >
          ✕
        </button>
      )}
    </div>
  );
}
