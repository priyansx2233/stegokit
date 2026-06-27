/**
 * ResultPanel — shows a successfully encoded/decoded image result.
 */
export default function ResultPanel({ title, imageDataUrl, filename = 'result.png', meta = [] }) {
  if (!imageDataUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageDataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fade-up" style={{
      background: 'var(--bg-card)',
      border: '1px solid rgba(0,229,195,0.2)',
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--accent)',
            boxShadow: '0 0 6px var(--accent)',
          }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>
            {title}
          </span>
        </div>
        <button
          onClick={handleDownload}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(0,229,195,0.08)',
            border: '1px solid rgba(0,229,195,0.2)',
            borderRadius: 5,
            color: 'var(--accent)',
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            letterSpacing: '0.05em',
            padding: '6px 14px',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0,229,195,0.15)';
            e.currentTarget.style.borderColor = 'rgba(0,229,195,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(0,229,195,0.08)';
            e.currentTarget.style.borderColor = 'rgba(0,229,195,0.2)';
          }}
        >
          ↓ Download
        </button>
      </div>

      {/* Image */}
      <div style={{ background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <img
          src={imageDataUrl}
          alt={title}
          style={{
            width: '100%',
            maxHeight: 320,
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>

      {/* Meta */}
      {meta.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${meta.length}, 1fr)`,
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          {meta.map(({ label, value }) => (
            <div key={label} style={{
              padding: '12px 18px',
              borderRight: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                {label}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                fontWeight: 600,
                color: '#ffffff',
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
