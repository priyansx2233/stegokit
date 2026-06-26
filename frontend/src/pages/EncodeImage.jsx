import { useState } from 'react';
import { stegoApi } from '../utils/api';
import { formatBytes } from '../utils/formatters';
import DropZone       from '../components/DropZone';
import PasswordField  from '../components/PasswordField';
import CapacityMeter  from '../components/CapacityMeter';
import ResultPanel    from '../components/ResultPanel';
import ErrorAlert     from '../components/ErrorAlert';
import Spinner        from '../components/Spinner';

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
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <div className="fade-up">
        <h1 className="section-title">🖼️ Hide Image in Image</h1>
        <p className="section-subtitle">
          Embed a secret image inside a carrier using LSB steganography across R, G, B channels.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <DropZone
          label="Carrier Image (Cover)"
          file={carrier.file}
          preview={carrier.preview}
          onChange={(file, preview) => { setCarrier({ file, preview }); setResult(null); setError(null); }}
          hint="This image will carry the hidden data"
          disabled={loading}
        />
        <DropZone
          label="Secret Image (to hide)"
          file={secret.file}
          preview={secret.preview}
          onChange={(file, preview) => { setSecret({ file, preview }); setResult(null); setError(null); }}
          hint="This image will be hidden inside the carrier"
          disabled={loading}
        />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <PasswordField value={password} onChange={setPassword} disabled={loading} />
      </div>

      {/* Capacity estimate when both files present */}
      {carrier.file && secret.file && (
        <div style={{ marginBottom: 20 }}>
          <CapacityMeter capacity={{
            maxBytes: null, usedBytes: secret.file.size,
            remainingBytes: null,
            percentUsed: result?.capacity?.percentUsed || '—',
            ...(result?.capacity || {}),
          }} />
        </div>
      )}

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <div style={{ marginTop: 20 }}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit}
          style={{ fontSize: 15, padding: '12px 32px', width: '100%' }}>
          {loading ? <><Spinner size={16} color="#fff" /> Encoding…</> : '🔒 Encode & Hide Image'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 28 }}>
          <ResultPanel
            title="Encoded Image Ready"
            imageDataUrl={result.imageDataUrl}
            filename="stegokit-encoded.png"
            meta={[
              { label: 'Encrypted',  value: result.encrypted ? 'AES-256' : 'None' },
              { label: 'File Size',  value: formatBytes(result.sizeBytes) },
              { label: 'Capacity %', value: `${result.capacity?.percentUsed || '?'}%` },
            ]}
          />
          {result.capacity && <div style={{ marginTop: 16 }}><CapacityMeter capacity={result.capacity} /></div>}
        </div>
      )}
    </div>
  );
}
