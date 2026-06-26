import { useState } from 'react';
import { stegoApi } from '../utils/api';
import { formatBytes } from '../utils/formatters';
import DropZone      from '../components/DropZone';
import ErrorAlert    from '../components/ErrorAlert';
import Spinner       from '../components/Spinner';

function BitBadge({ bit, changed }) {
  return (
    <span style={{
      display: 'inline-block', width: 18, height: 22,
      textAlign: 'center', lineHeight: '22px',
      fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
      color: changed ? '#ef4444' : '#06d6a0',
      background: changed ? 'rgba(239,68,68,0.1)' : 'rgba(6,214,160,0.08)',
      borderRadius: 4,
    }}>{bit}</span>
  );
}

function PixelRow({ sample }) {
  const { x, y, pixelIndex, original, encoded, changedBits } = sample;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 10, padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: '#8888a8' }}>
          Pixel #{pixelIndex} @ ({x}, {y})
        </span>
        <span style={{ fontSize: 11, color: changedBits.length > 0 ? '#ef4444' : '#06d6a0' }}>
          {changedBits.length} LSB{changedBits.length !== 1 ? 's' : ''} changed
        </span>
      </div>

      {['r', 'g', 'b'].map((ch) => {
        const ob = original.binary[ch];
        const eb = encoded.binary[ch];
        const chChanged = changedBits.includes(ch);
        return (
          <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12 }}>
            <span style={{
              width: 12, fontWeight: 700, textTransform: 'uppercase',
              color: ch === 'r' ? '#f87171' : ch === 'g' ? '#4ade80' : '#60a5fa',
            }}>{ch}</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {ob.split('').map((bit, i) => (
                <BitBadge key={i} bit={bit} changed={i === 7 && chChanged} />
              ))}
            </div>
            <span style={{ color: '#8888a8' }}>→</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {eb.split('').map((bit, i) => (
                <BitBadge key={i} bit={bit} changed={i === 7 && chChanged} />
              ))}
            </div>
            <span style={{ color: '#8888a8', fontSize: 11 }}>
              ({original[ch]} → {encoded[ch]})
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Visualize() {
  const [carrier, setCarrier] = useState({ file: null, preview: null });
  const [encoded, setEncoded] = useState({ file: null, preview: null });
  const [samples, setSamples] = useState('16');
  const [loading, setLoading] = useState(false);
  const [report,  setReport]  = useState(null);
  const [error,   setError]   = useState(null);

  const handleSubmit = async () => {
    if (!carrier.file || !encoded.file) { setError('Please upload both images.'); return; }
    setLoading(true); setError(null); setReport(null);
    try {
      const res = await stegoApi.visualize({ carrier: carrier.file, encoded: encoded.file, sampleCount: parseInt(samples) });
      setReport(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      <div className="fade-up">
        <h1 className="section-title">📊 LSB Visualization</h1>
        <p className="section-subtitle">
          Inspect exactly which pixel bits were modified and understand how steganography works at the binary level.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <DropZone label="Original Carrier" file={carrier.file} preview={carrier.preview}
          onChange={(f, p) => { setCarrier({ file: f, preview: p }); setReport(null); }} disabled={loading} />
        <DropZone label="Encoded Image" file={encoded.file} preview={encoded.preview}
          onChange={(f, p) => { setEncoded({ file: f, preview: p }); setReport(null); }} disabled={loading} />
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <label className="label" style={{ margin: 0, minWidth: 120 }}>Pixel Samples</label>
        <input className="input" type="number" min="4" max="64" value={samples}
          onChange={(e) => setSamples(e.target.value)} style={{ width: 80 }} disabled={loading} />
        <span style={{ fontSize: 12, color: '#8888a8' }}>Pixels to sample from the image (4–64)</span>
      </div>

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      <button className="btn btn-primary" onClick={handleSubmit}
        disabled={!carrier.file || !encoded.file || loading}
        style={{ fontSize: 15, padding: '12px 32px', width: '100%', marginTop: 12 }}>
        {loading ? <><Spinner size={16} color="#fff" /> Analysing…</> : '🔬 Run Visualization'}
      </button>

      {report && (
        <div className="fade-up" style={{ marginTop: 32 }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
            {[
              { label: 'Image Size',     value: `${report.imageInfo.width} × ${report.imageInfo.height}` },
              { label: 'Total Pixels',   value: report.imageInfo.totalPixels.toLocaleString() },
              { label: 'Max Capacity',   value: formatBytes(report.capacity.maxBytes) },
              { label: 'Payload Stored', value: formatBytes(report.capacity.usedBytes) },
              { label: 'Capacity Used',  value: `${report.capacity.percentUsed}%` },
              { label: 'Algorithm',      value: '3-bit LSB (R/G/B)' },
            ].map(({ label, value }) => (
              <div key={label} className="card" style={{ textAlign: 'center', padding: '14px 12px' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f1f6', marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: 11, color: '#8888a8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Header bits */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="label">32-bit Header (Payload Length Encoded in First 32 Pixels)</div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, letterSpacing: 2, color: '#f59e0b', wordBreak: 'break-all' }}>
              {report.headerBits.slice(0, 16)}
              <span style={{ color: '#8888a8' }}>{report.headerBits.slice(16)}</span>
            </div>
            <div style={{ fontSize: 12, color: '#8888a8', marginTop: 6 }}>
              Decoded value: {report.payloadBytes.toLocaleString()} bytes
            </div>
          </div>

          {/* Pixel samples */}
          <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>
            Pixel Comparison Samples
            <span style={{ fontSize: 13, color: '#8888a8', fontWeight: 400, marginLeft: 10 }}>
              (Red = changed LSB, Green = unchanged)
            </span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {report.samples.map((s) => (
              <PixelRow key={s.pixelIndex} sample={s} />
            ))}
          </div>

          <div className="card" style={{ marginTop: 20, background: 'rgba(124,106,247,0.06)', borderColor: 'rgba(124,106,247,0.2)' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Algorithm Details</div>
            <div style={{ fontSize: 13, color: '#8888a8', lineHeight: 1.7 }}>
              <strong style={{ color: '#f1f1f6' }}>Method:</strong> {report.algorithm}<br />
              <strong style={{ color: '#f1f1f6' }}>Header:</strong> {report.headerFormat}<br />
              <strong style={{ color: '#f1f1f6' }}>Distortion:</strong> Maximum 1-level change per channel (e.g. 200 → 201 or 200 → 199)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
