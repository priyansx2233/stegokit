import { useState } from 'react';
import { stegoApi } from '../utils/api';
import { formatBytes } from '../utils/formatters';
import DropZone       from '../components/DropZone';
import PasswordField  from '../components/PasswordField';
import ResultPanel    from '../components/ResultPanel';
import ErrorAlert     from '../components/ErrorAlert';
import Spinner        from '../components/Spinner';

const SAMPLE_TEXTS = [
  'Hello, World! 🌍',
  'The quick brown fox jumps over the lazy dog.',
  '秘密のメッセージ — Secret Message in Japanese',
  'مرحبا — Arabic text hidden in plain sight',
];

const IconEncode = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export default function EncodeText() {
  const [carrier,  setCarrier]  = useState({ file: null, preview: null });
  const [text,     setText]     = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);

  const byteLen = new TextEncoder().encode(text).length;

  const handleSubmit = async () => {
    if (!carrier.file) { setError('Please upload a carrier image.'); return; }
    if (!text.trim())  { setError('Please enter some text to hide.'); return; }
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await stegoApi.encodeText({ carrier: carrier.file, text, password: password || undefined });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = carrier.file && text.trim() && !loading;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
      {/* ─── Page header ── */}
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <h1 style={{
          fontSize: 'clamp(2.2rem, 4vw, 3rem)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#ffffff',
          marginBottom: 8,
        }}>
          Hide Text
        </h1>
        <p style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.65,
          maxWidth: 600,
        }}>
          Embed any UTF-8 text — including Unicode &amp; emoji — invisibly inside a carrier image using LSB encoding.
        </p>
      </div>

      {/* ─── Two columns: carrier + text ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.4fr',
        gap: 16,
        marginBottom: 20,
      }}>
        {/* Carrier dropzone */}
        <DropZone
          label="Carrier Image"
          headerIcon="file"
          emptyTitle="Drag & drop carrier image"
          emptyHint="Any PNG or JPG — bigger = more capacity"
          file={carrier.file}
          preview={carrier.preview}
          onChange={(f, p) => { setCarrier({ file: f, preview: p }); setResult(null); setError(null); }}
          disabled={loading}
        />

        {/* Text input */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          overflow: 'hidden',
        }}>
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
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
            }}>Secret Text</span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
            }}>
              {text.length} chars · {byteLen} bytes
            </span>
          </div>

          <div style={{ padding: '14px 16px' }}>
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setError(null); }}
              placeholder="Type your secret message here…"
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--bg-base)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6,
                padding: '12px 14px',
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--text-primary)',
                outline: 'none',
                resize: 'vertical',
                minHeight: 130,
                boxSizing: 'border-box',
                transition: 'border-color 0.2s',
                lineHeight: 1.65,
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,229,195,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />

            {/* Sample quick-fill buttons */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {SAMPLE_TEXTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setText(s)}
                  disabled={loading}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 4,
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 11,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontFamily: "'JetBrains Mono', monospace",
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  {s.slice(0, 22)}…
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Encryption Parameters ── */}
      <div style={{ maxWidth: 500, margin: '0 auto 28px' }}>
        <PasswordField value={password} onChange={setPassword} disabled={loading} showHeader={true} />
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
          maxWidth: 400,
          margin: '0 auto',
          padding: '16px 32px',
          background: canSubmit ? '#ffffff' : 'rgba(255,255,255,0.1)',
          color: canSubmit ? '#000000' : 'rgba(255,255,255,0.25)',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 700,
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseEnter={e => { if (canSubmit) e.currentTarget.style.background = '#e8e8e8'; }}
        onMouseLeave={e => { if (canSubmit) e.currentTarget.style.background = '#ffffff'; }}
      >
        {loading ? <><Spinner size={16} color="#000" /> Encoding…</> : <><IconEncode /> Encode Text into Image</>}
      </button>

      {result && (
        <div style={{ marginTop: 36 }}>
          <ResultPanel
            title="Text Embedded Successfully"
            imageDataUrl={result.imageDataUrl}
            filename="stegokit-text-encoded.png"
            meta={[
              { label: 'Characters', value: result.textLength },
              { label: 'Encrypted',  value: result.encrypted ? 'AES-256' : 'None' },
              { label: 'File Size',  value: formatBytes(result.sizeBytes) },
            ]}
          />
        </div>
      )}
    </div>
  );
}
