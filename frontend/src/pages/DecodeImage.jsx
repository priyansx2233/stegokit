import { useState } from 'react';
import { stegoApi } from '../utils/api';
import { formatBytes } from '../utils/formatters';
import DropZone       from '../components/DropZone';
import PasswordField  from '../components/PasswordField';
import ResultPanel    from '../components/ResultPanel';
import ErrorAlert     from '../components/ErrorAlert';
import Spinner        from '../components/Spinner';

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

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <div className="fade-up">
        <h1 className="section-title">🔍 Extract Hidden Image</h1>
        <p className="section-subtitle">Upload a StegoKit-encoded image to recover the hidden image inside.</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <DropZone
          label="Encoded Carrier Image"
          file={encoded.file} preview={encoded.preview}
          onChange={(f, p) => { setEncoded({ file: f, preview: p }); setResult(null); setError(null); }}
          hint="Upload an image that was encoded with StegoKit"
          disabled={loading}
        />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <PasswordField value={password} onChange={setPassword}
          label="Decryption Password (if payload was encrypted)" disabled={loading} />
      </div>

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <button className="btn btn-primary" onClick={handleSubmit} disabled={!encoded.file || loading}
        style={{ fontSize: 15, padding: '12px 32px', width: '100%', marginTop: 12 }}>
        {loading ? <><Spinner size={16} color="#fff" /> Extracting…</> : '🔓 Extract Hidden Image'}
      </button>

      {result && (
        <div style={{ marginTop: 28 }}>
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
