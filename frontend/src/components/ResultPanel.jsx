/**
 * ResultPanel — shows a successfully encoded/decoded image result.
 * Props:
 *   title        — panel heading
 *   imageDataUrl — base64 data URL
 *   filename     — download filename
 *   meta         — array of { label, value } metadata items
 */
export default function ResultPanel({ title, imageDataUrl, filename = 'result.png', meta = [] }) {
  if (!imageDataUrl) return null;

  const handleDownload = async () => {
    const a = document.createElement('a');
    // blob: URLs work directly; data: URLs also work as-is
    a.href = imageDataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="card fade-up" style={{ borderColor: 'rgba(6,214,160,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, margin: 0, color: '#06d6a0' }}>
          ✓ {title}
        </h3>
        <button className="btn btn-accent" onClick={handleDownload} style={{ fontSize: 13, padding: '7px 16px' }}>
          ⬇ Download
        </button>
      </div>

      <img
        src={imageDataUrl}
        alt={title}
        style={{
          width: '100%', maxHeight: 320,
          objectFit: 'contain', borderRadius: 10,
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      />

      {meta.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10, marginTop: 16,
        }}>
          {meta.map(({ label, value }) => (
            <div key={label} style={{
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 10, padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{ fontSize: 12, color: '#8888a8', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f1f6', wordBreak: 'break-all' }}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
