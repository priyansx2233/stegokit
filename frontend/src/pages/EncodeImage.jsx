import { useState } from 'react';
import { stegoApi } from '../utils/api';
import { formatBytes } from '../utils/formatters';
import DropZone       from '../components/DropZone';
import PasswordField  from '../components/PasswordField';
import ResultPanel    from '../components/ResultPanel';
import ErrorAlert     from '../components/ErrorAlert';
import Spinner        from '../components/Spinner';

const IconEncode = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

export default function EncodeImage() {
  const [carrier,  setCarrier]  = useState({ file: null, preview: null });
  const [secret,   setSecret]   = useState({ file: null, preview: null });
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);

  const handleSubmit = async () => {
    if (!carrier.file || !secret.file) {
      setError('Please upload both a carrier image and a secret image.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await stegoApi.encodeImage({
        carrier:  carrier.file,
        secret:   secret.file,
        password: password || undefined,
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = carrier.file && secret.file && !loading;

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
          Hide Image
        </h1>
        <p style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.65,
          maxWidth: 600,
        }}>
          Embed a secret image within a carrier image using Least Significant Bit (LSB)
          steganography.
        </p>
      </div>

      {/* ─── Two dropzone cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: 24,
      }}>
        <DropZone
          label="Carrier Image (Cover)"
          headerIcon="file"
          emptyTitle="Drag & drop cover image"
          emptyHint="PNG, JPG up to 10MB"
          file={carrier.file}
          preview={carrier.preview}
          onChange={(file, preview) => { setCarrier({ file, preview }); setResult(null); setError(null); }}
          disabled={loading}
        />
        <DropZone
          label="Secret Image (To Hide)"
          headerIcon="lock"
          emptyTitle="Drag & drop secret image"
          emptyHint="Must be smaller than cover"
          file={secret.file}
          preview={secret.preview}
          onChange={(file, preview) => { setSecret({ file, preview }); setResult(null); setError(null); }}
          disabled={loading}
        />
      </div>

      {/* ─── Encryption Parameters (centered) ── */}
      <div style={{
        maxWidth: 500,
        margin: '0 auto 32px',
      }}>
        <PasswordField
          value={password}
          onChange={setPassword}
          disabled={loading}
          showHeader={true}
        />
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
          background: canSubmit ? '#ffffff' : 'rgba(255,255,255,0.12)',
          color: canSubmit ? '#000000' : 'rgba(255,255,255,0.3)',
          border: 'none',
          borderRadius: 8,
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '0.01em',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseEnter={e => { if (canSubmit) e.currentTarget.style.background = '#e8e8e8'; }}
        onMouseLeave={e => { if (canSubmit) e.currentTarget.style.background = '#ffffff'; }}
      >
        {loading ? (
          <><Spinner size={16} color="#000" /> Encoding…</>
        ) : (
          <><IconEncode /> Encode & Hide Image</>
        )}
      </button>

      {result && (
        <div style={{ marginTop: 36 }}>
          <ResultPanel
            title="Encoded Image Ready"
            imageDataUrl={result.imageDataUrl}
            filename="stegokit-encoded.png"
            meta={[
              { label: 'Encrypted',  value: result.encrypted ? 'AES-256' : 'None' },
              { label: 'File Size',  value: formatBytes(result.sizeBytes) },
            ]}
          />
        </div>
      )}
    </div>
  );
}
