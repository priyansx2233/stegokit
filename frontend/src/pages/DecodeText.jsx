import { useState } from 'react';
import { stegoApi }  from '../utils/api';
import DropZone       from '../components/DropZone';
import ErrorAlert     from '../components/ErrorAlert';
import Spinner        from '../components/Spinner';

const IconExtract = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const IconLockSmall = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function DecodeText() {
  const [encoded,  setEncoded]  = useState({ file: null, preview: null });
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [text,     setText]     = useState(null);
  const [error,    setError]    = useState(null);
  const [copied,   setCopied]   = useState(false);

  const handleSubmit = async () => {
    if (!encoded.file) { setError('Please upload an encoded image.'); return; }
    setLoading(true); setError(null); setText(null);
    try {
      const res = await stegoApi.decodeText({ encoded: encoded.file, password: password || undefined });
      setText(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const canSubmit = encoded.file && !loading;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      {/* ─── Page header ── */}
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <h1 style={{
          fontSize: 'clamp(2.2rem, 4vw, 3rem)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#ffffff',
          marginBottom: 8,
        }}>
          Extract Text
        </h1>
        <p style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.65,
          maxWidth: 540,
        }}>
          Decode and recover text that was hidden inside a StegoKit-encoded image.
        </p>
      </div>

      {/* ─── Dropzone ── */}
      <div style={{ marginBottom: 20 }}>
        <DropZone
          label="Encoded Image"
          headerIcon="lock"
          emptyTitle="Drag & drop encoded image"
          emptyHint="Upload a StegoKit image with hidden text"
          file={encoded.file}
          preview={encoded.preview}
          onChange={(f, p) => { setEncoded({ file: f, preview: p }); setText(null); setError(null); }}
          disabled={loading}
        />
      </div>

      {/* ─── Decryption key ── */}
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
          marginBottom: 12,
        }}>
          Decryption Key (Optional)
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
            placeholder="Enter password if text was encrypted..."
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

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      {/* ─── CTA ── */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          width: '100%',
          padding: '16px 32px',
          background: canSubmit ? '#ffffff' : 'rgba(255,255,255,0.1)',
          color: canSubmit ? '#000000' : 'rgba(255,255,255,0.25)',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 700,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s',
          marginBottom: 28,
        }}
        onMouseEnter={e => { if (canSubmit) e.currentTarget.style.background = '#e8e8e8'; }}
        onMouseLeave={e => { if (canSubmit) e.currentTarget.style.background = '#ffffff'; }}
      >
        {loading
          ? <><Spinner size={16} color="#000" /> Extracting…</>
          : <><IconExtract /> Extract Hidden Text</>
        }
      </button>

      {/* ─── Result ── */}
      {text && (
        <div className="fade-up" style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(0,229,195,0.25)',
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          {/* Result header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 5px var(--accent)',
              }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>
                Text Recovered
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: 'rgba(255,255,255,0.3)',
              }}>
                {text.textLength} chars · {text.decrypted ? 'Decrypted' : 'Plain'}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 5,
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 12,
                  padding: '5px 12px',
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                <IconCopy /> {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Recovered text */}
          <div style={{
            background: '#0a0a0a',
            padding: '18px 20px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 14,
            color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.75,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxHeight: 360,
            overflow: 'auto',
          }}>
            {text.text}
          </div>
        </div>
      )}
    </div>
  );
}
