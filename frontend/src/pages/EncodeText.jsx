import { useState } from 'react';
import { stegoApi } from '../utils/api';
import { formatBytes } from '../utils/formatters';
import DropZone       from '../components/DropZone';
import PasswordField  from '../components/PasswordField';
import CapacityMeter  from '../components/CapacityMeter';
import ResultPanel    from '../components/ResultPanel';
import ErrorAlert     from '../components/ErrorAlert';
import Spinner        from '../components/Spinner';

const SAMPLE_TEXTS = [
  'Hello, World! 🌍',
  'The quick brown fox jumps over the lazy dog.',
  '秘密のメッセージ — Secret Message in Japanese',
  'مرحبا — Arabic text hidden in plain sight',
];

export default function EncodeText() {
  const [carrier,  setCarrier]  = useState({ file: null, preview: null });
  const [text,     setText]     = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);

  // TextEncoder works in browser; Buffer doesn't exist in browser context
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

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <div className="fade-up">
        <h1 className="section-title">✍️ Hide Text in Image</h1>
        <p className="section-subtitle">
          Embed any UTF-8 text — including Unicode & emoji — invisibly inside a carrier image using LSB encoding.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <DropZone
            label="Carrier Image"
            file={carrier.file} preview={carrier.preview}
            onChange={(f, p) => { setCarrier({ file: f, preview: p }); setResult(null); setError(null); }}
            hint="Any PNG or JPG — bigger = more capacity"
            disabled={loading}
          />
        </div>

        <div className="card">
          <label className="label">Secret Text</label>
          <textarea
            className="input"
            value={text}
            onChange={(e) => { setText(e.target.value); setError(null); }}
            placeholder="Type your secret message here…"
            style={{ minHeight: 140, marginBottom: 10 }}
            disabled={loading}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SAMPLE_TEXTS.map((s) => (
              <button key={s} className="btn btn-secondary"
                style={{ fontSize: 11, padding: '4px 10px' }}
                onClick={() => setText(s)} disabled={loading}>
                {s.slice(0, 20)}…
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#8888a8', marginTop: 10 }}>
            {text.length} characters · {byteLen} bytes
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <PasswordField value={password} onChange={setPassword} disabled={loading} />
      </div>

      {result?.capacity && (
        <div style={{ marginBottom: 20 }}>
          <CapacityMeter capacity={result.capacity} />
        </div>
      )}

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <button className="btn btn-primary" onClick={handleSubmit}
        disabled={!carrier.file || !text.trim() || loading}
        style={{ fontSize: 15, padding: '12px 32px', width: '100%', marginTop: 12 }}>
        {loading ? <><Spinner size={16} color="#fff" /> Encoding…</> : '🔒 Encode Text into Image'}
      </button>

      {result && (
        <div style={{ marginTop: 28 }}>
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
          {result.capacity && <div style={{ marginTop: 16 }}><CapacityMeter capacity={result.capacity} /></div>}
        </div>
      )}
    </div>
  );
}
