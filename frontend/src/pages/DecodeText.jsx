import { useState } from 'react';
import { stegoApi }  from '../utils/api';
import DropZone       from '../components/DropZone';
import PasswordField  from '../components/PasswordField';
import ErrorAlert     from '../components/ErrorAlert';
import Spinner        from '../components/Spinner';

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

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <div className="fade-up">
        <h1 className="section-title">📝 Extract Hidden Text</h1>
        <p className="section-subtitle">Decode and recover text that was hidden inside a StegoKit-encoded image.</p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <DropZone
          label="Encoded Image"
          file={encoded.file} preview={encoded.preview}
          onChange={(f, p) => { setEncoded({ file: f, preview: p }); setText(null); setError(null); }}
          hint="Upload a StegoKit image with hidden text"
          disabled={loading}
        />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <PasswordField
          value={password} onChange={setPassword}
          label="Decryption Password (if text was encrypted)"
          disabled={loading}
        />
      </div>

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <button className="btn btn-primary" onClick={handleSubmit}
        disabled={!encoded.file || loading}
        style={{ fontSize: 15, padding: '12px 32px', width: '100%', marginTop: 12 }}>
        {loading ? <><Spinner size={16} color="#fff" /> Extracting…</> : '🔓 Extract Hidden Text'}
      </button>

      {text && (
        <div className="card fade-up" style={{ marginTop: 28, borderColor: 'rgba(6,214,160,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, color: '#06d6a0', fontSize: 15 }}>✓ Text Recovered</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#8888a8' }}>
                {text.textLength} chars · {text.decrypted ? '🔐 Decrypted' : 'Plain'}
              </span>
              <button className="btn btn-secondary" onClick={handleCopy}
                style={{ fontSize: 12, padding: '5px 12px' }}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 10, padding: '16px', fontFamily: 'monospace',
            fontSize: 14, color: '#f1f1f6', lineHeight: 1.7,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            maxHeight: 320, overflow: 'auto',
          }}>
            {text.text}
          </div>
        </div>
      )}
    </div>
  );
}
