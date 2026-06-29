import { useState } from 'react';
import { stegoApi } from '../utils/api';
import { formatBytes } from '../utils/formatters';
import DropZone       from '../components/DropZone';
import ResultPanel    from '../components/ResultPanel';
import ErrorAlert     from '../components/ErrorAlert';
import Spinner        from '../components/Spinner';

const IconSignal = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
    <line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);

const IconLockSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconRecover = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const INITIAL_LOG = [
  { text: '> Waiting for carrier image...', color: 'rgba(255,255,255,0.3)' },
];

const LOADED_LOG = [
  { text: '> Waiting for carrier image...', color: 'rgba(255,255,255,0.2)' },
  { text: '> File loaded: {filename}',      color: 'rgba(255,255,255,0.5)' },
  { text: '> Analyzing LSB patterns...',    color: 'rgba(255,255,255,0.5)' },
  { text: '> Payload signature detected.',  color: 'var(--accent)', bold: true },
];

export default function DecodeImage() {
  const [encoded,  setEncoded]  = useState({ file: null, preview: null });
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);

  const handleSubmit = async () => {
    if (!encoded.file) { setError('Please upload an encoded image.'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await stegoApi.decodeImage({ encoded: encoded.file, password: password || undefined });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const logLines = encoded.file
    ? LOADED_LOG.map(l => ({ ...l, text: l.text.replace('{filename}', encoded.file.name) }))
    : INITIAL_LOG;

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '48px 24px' }}>
      {}
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <h1 style={{
          fontSize: 'clamp(2.2rem, 4vw, 3rem)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#ffffff',
          marginBottom: 8,
        }}>
          Extract Payload
        </h1>
        <p style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.65,
          maxWidth: 600,
        }}>
          Recover hidden data from an encoded carrier image. Ensure you provide the
          correct decryption key if the payload was secured.
        </p>
      </div>

      {}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: 20,
        alignItems: 'start',
      }}>

        {}
        <div>
          {}
          <div style={{ marginBottom: 20 }}>
            <DropZone
              variant="large"
              emptyTitle="Drop Encoded Carrier Image"
              emptyHint={`Drag and drop a PNG or BMP file here, or click to browse.\nJPEG files are generally not supported for high-fidelity extraction.`}
              file={encoded.file}
              preview={encoded.preview}
              onChange={(f, p) => { setEncoded({ file: f, preview: p }); setResult(null); setError(null); }}
              disabled={loading}
            />
          </div>

          {}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '18px 20px',
            marginBottom: 20,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: 14,
            }}>
              Decryption Parameters
            </div>

            {}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                Decryption Key (Password)
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  <IconLockSmall />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password if payload is encrypted..."
                  disabled={loading}
                  autoComplete="new-password"
                  style={{
                    width: '100%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6,
                    padding: '10px 14px 10px 34px',
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,229,195,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              </div>
            </div>

            {}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
            }}>
              <input type="checkbox" style={{ accentColor: 'var(--accent)' }} />
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                Attempt brute-force header recovery
              </span>
              <span style={{
                marginLeft: 'auto',
                color: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </span>
            </label>
          </div>

          <ErrorAlert error={error} onDismiss={() => setError(null)} />

          {}
          <button
            onClick={handleSubmit}
            disabled={!encoded.file || loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              width: '100%',
              padding: '16px 32px',
              background: (encoded.file && !loading) ? '#ffffff' : 'rgba(255,255,255,0.1)',
              color: (encoded.file && !loading) ? '#000000' : 'rgba(255,255,255,0.25)',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: (encoded.file && !loading) ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => { if (encoded.file && !loading) e.currentTarget.style.background = '#e8e8e8'; }}
            onMouseLeave={e => { if (encoded.file && !loading) e.currentTarget.style.background = '#ffffff'; }}
          >
            {loading
              ? <><Spinner size={16} color="#000" /> Extracting…</>
              : <><IconRecover /> Recover Hidden Data</>
            }
          </button>
        </div>

        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            {}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
              }}>
                Analysis Log
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>
                <IconSignal />
              </span>
            </div>

            {}
            <div style={{
              padding: '14px 16px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              lineHeight: 2,
              minHeight: 120,
            }}>
              {logLines.map((line, i) => (
                <div key={i} style={{
                  color: line.color,
                  fontWeight: line.bold ? 600 : 400,
                }}>
                  {line.text}
                </div>
              ))}
            </div>

            {}
            {encoded.file && (
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '12px 16px',
              }}>
                {[
                  { label: 'Resolution',     value: '—' },
                  { label: 'Color Depth',    value: '24-bit RGB' },
                  { label: 'Est. Capacity',  value: '—' },
                  { label: 'Payload Size',   value: '—', accent: true },
                  { label: 'Encryption',     value: password ? 'AES-256 GCM' : 'None' },
                ].map(row => (
                  <div key={row.label} className="stat-row">
                    <span className="stat-label">{row.label}</span>
                    <span className={`stat-value${row.accent ? ' accent' : ''}`}>{row.value}</span>
                  </div>
                ))}

                <div style={{
                  marginTop: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: password ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.25)',
                }}>
                  {password
                    ? '> Requires decryption key.'
                    : '> No password provided.'
                  }
                </div>
              </div>
            )}
          </div>

          {}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '14px 16px',
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: 12,
            }}>
              Channel Density
            </div>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 32 }}>
              {[0.8, 0.5, 0.9, 1.0, 0.7, 0.85, 0.6, 0.95].map((h, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: `${h * 100}%`,
                  background: encoded.file
                    ? `rgba(255,255,255,${0.3 + h * 0.4})`
                    : 'rgba(255,255,255,0.08)',
                  borderRadius: '2px 2px 0 0',
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div style={{ marginTop: 36 }}>
          <ResultPanel
            title="Hidden Image Recovered"
            imageDataUrl={result.imageDataUrl}
            filename="stegokit-recovered.png"
            meta={[
              { label: 'Decrypted', value: result.decrypted ? 'AES-256' : 'Plain' },
              { label: 'File Size', value: formatBytes(result.sizeBytes) },
            ]}
          />
        </div>
      )}
    </div>
  );
}
