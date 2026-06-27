import { useState, useCallback } from 'react';
import { stegoApi } from '../utils/api';
import { formatBytes } from '../utils/formatters';
import DropZone      from '../components/DropZone';
import ErrorAlert    from '../components/ErrorAlert';
import Spinner       from '../components/Spinner';

/* ─── Icons ─────────────────────────────────────────────────── */
const IconExport = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

const IconSwap = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/>
    <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/>
    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);

/* ─── Mini LSB Bit Matrix ────────────────────────────────────── */
function BitMatrix({ data, modified }) {
  const COLS = 12;
  const rows = Math.min(8, Math.ceil((data?.length || 48) / COLS));
  const total = COLS * rows;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${COLS}, 1fr)`,
      gap: 2,
      padding: '10px 0',
    }}>
      {Array.from({ length: total }).map((_, i) => {
        const isModified = modified && (i % 3 === 0 || i % 7 === 0 || i % 11 === 0);
        const isPink     = modified && i % 5 === 0;
        return (
          <div key={i} style={{
            height: 14,
            borderRadius: 2,
            background: isModified
              ? isPink ? '#ff6b8a' : 'var(--accent)'
              : i % 2 === 0 ? '#2a2a2a' : '#333',
          }} />
        );
      })}
    </div>
  );
}

/* ─── Pixel Row (from API) ───────────────────────────────────── */
function PixelRow({ sample }) {
  const { x, y, pixelIndex, original, encoded, changedBits } = sample;
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 8, padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          Pixel #{pixelIndex} @ ({x}, {y})
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: changedBits.length > 0 ? '#ff6b8a' : 'var(--accent)',
        }}>
          {changedBits.length} LSB{changedBits.length !== 1 ? 's' : ''} changed
        </span>
      </div>
      {['r', 'g', 'b'].map((ch) => {
        const ob = original.binary[ch];
        const eb = encoded.binary[ch];
        const chChanged = changedBits.includes(ch);
        return (
          <div key={ch} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontSize: 12 }}>
            <span style={{
              width: 12, fontWeight: 700, textTransform: 'uppercase',
              fontFamily: "'JetBrains Mono', monospace",
              color: ch === 'r' ? '#ffa198' : ch === 'g' ? 'var(--accent)' : '#4d9fff',
            }}>{ch}</span>
            <div style={{ display: 'flex', gap: 1 }}>
              {ob.split('').map((bit, i) => (
                <span key={i} style={{
                  display: 'inline-block', width: 16, height: 20,
                  textAlign: 'center', lineHeight: '20px',
                  fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                  color: (i === 7 && chChanged) ? '#000' : 'rgba(255,255,255,0.5)',
                  background: (i === 7 && chChanged) ? '#ff6b8a' : 'rgba(255,255,255,0.05)',
                  borderRadius: 3,
                }}>{bit}</span>
              ))}
            </div>
            <span style={{ color: 'var(--accent)', fontSize: 12 }}>→</span>
            <div style={{ display: 'flex', gap: 1 }}>
              {eb.split('').map((bit, i) => (
                <span key={i} style={{
                  display: 'inline-block', width: 16, height: 20,
                  textAlign: 'center', lineHeight: '20px',
                  fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
                  color: (i === 7 && chChanged) ? '#000' : 'rgba(255,255,255,0.5)',
                  background: (i === 7 && chChanged) ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                  borderRadius: 3,
                }}>{bit}</span>
              ))}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, fontFamily: 'monospace' }}>
              ({original[ch]} → {encoded[ch]})
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Inspection Log Entry ───────────────────────────────────── */
const LOG_ENTRIES = [
  { time: '[14:02:11]', msg: 'System initialized. Loading target files...' },
  { time: '[14:02:12]', msg: 'Original loaded: CARRIER_ORIGINAL.PNG (2.4MB, 1920x1080)' },
  { time: '[14:02:12]', msg: 'Encoded loaded: CARRIER_STEGO_OUT.PNG (2.4MB, 1920x1080)' },
  { time: '[14:02:13]', msg: 'Performing bitwise XOR comparison...' },
  { time: '[14:02:14]', msg: 'Scanning LSB channel (Red, Depth=1)...' },
  { time: '[14:02:14]', msg: 'ALIGNMENT MISMATCH DETECTED at offset 0x00001002. Payload [k+1] header here.', warn: true },
];

export default function Visualize() {
  const [carrier,  setCarrier]  = useState({ file: null, preview: null });
  const [encoded,  setEncoded]  = useState({ file: null, preview: null });
  const [channel,  setChannel]  = useState('RGB');
  const [bitDepth, setBitDepth] = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [report,   setReport]   = useState(null);
  const [error,    setError]    = useState(null);

  const handleSubmit = async () => {
    if (!carrier.file || !encoded.file) { setError('Please upload both images.'); return; }
    setLoading(true); setError(null); setReport(null);
    try {
      const res = await stegoApi.visualize({ carrier: carrier.file, encoded: encoded.file, sampleCount: 16 });
      setReport(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasImages = carrier.file && encoded.file;

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '48px 24px' }}>
      {/* ─── Page header ── */}
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}>
          <div>
            {/* Active label */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 10,
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 6px var(--accent)',
              }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
              }}>
                Analysis Mode Active
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 4vw, 2.8rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              marginBottom: 8,
            }}>
              Visualize Modifications
            </h1>
            <p style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.6,
              maxWidth: 520,
            }}>
              Inspect Least Significant Bit (LSB) changes at the pixel level. Compare original carrier
              data against encoded payload structure.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconExport /> Export Diff
            </button>
            <button
              onClick={handleSubmit}
              disabled={!hasImages || loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: (hasImages && !loading) ? '#ffffff' : 'rgba(255,255,255,0.08)',
                color: (hasImages && !loading) ? '#000' : 'rgba(255,255,255,0.2)',
                border: '1px solid ' + ((hasImages && !loading) ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)'),
                borderRadius: 5,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: (hasImages && !loading) ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s',
              }}
            >
              {loading ? <Spinner size={13} color="#000" /> : <IconPlay />}
              {loading ? 'Analysing…' : 'Run Analysis'}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Controls bar ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        flexWrap: 'wrap',
      }}>
        {/* Channel Selection */}
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: 8,
          }}>
            Channel Selection
          </div>
          <div className="channel-toggle">
            {['RGB', 'RED', 'GRN', 'BLU'].map(ch => (
              <button
                key={ch}
                onClick={() => setChannel(ch)}
                className={channel === ch ? 'active' : ''}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Bit Plane slider */}
        <div style={{ flex: 1, minWidth: 160 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
            }}>
              Bit Plane (LSB Depth)
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'rgba(255,255,255,0.6)',
            }}>
              {bitDepth} BIT
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            value={bitDepth}
            onChange={e => setBitDepth(Number(e.target.value))}
          />
        </div>

        {/* View Mode icons */}
        <div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: 8,
          }}>
            View Mode
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              /* split view */
              <svg key="split" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>,
              /* overlay */
              <svg key="overlay" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
              /* grid */
              <svg key="grid" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
            ].map((icon, i) => (
              <button key={i} style={{
                width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: '1px solid ' + (i === 0 ? 'rgba(255,255,255,0.2)' : 'transparent'),
                borderRadius: 5,
                color: i === 0 ? '#fff' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Image comparison panels ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        marginBottom: 20,
        position: 'relative',
      }}>
        {/* Original */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em' }}>CARRIER_ORIGINAL.PNG</span>
            </div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, fontWeight: 600,
              color: 'rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3, padding: '2px 8px',
              letterSpacing: '0.06em',
            }}>CLEAN</span>
          </div>

          <div style={{
            minHeight: 200,
            background: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {carrier.preview ? (
              <img src={carrier.preview} alt="Original" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: 12 }}>
                no image loaded
              </div>
            )}
          </div>

          {/* LSB Matrix label */}
          <div style={{ padding: '10px 14px 2px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>LSB BIT MATRIX (SECTOR 0x0A4)</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>Offset: 4096px</span>
          </div>
          <div style={{ padding: '0 14px 10px' }}>
            <BitMatrix modified={false} />
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, padding: '0 14px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#2a2a2a' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>■ 0 (Even)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#444' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>■ 1 (Odd)</span>
            </div>
          </div>
        </div>

        {/* Swap button */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          width: 36, height: 36,
          borderRadius: '50%',
          background: 'var(--bg-elevated)',
          border: '1px solid rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)',
          cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
        }}>
          <IconSwap />
        </div>

        {/* Encoded */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          overflow: 'hidden',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.05em' }}>CARRIER_STEGO_OUT.PNG</span>
            </div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, fontWeight: 700,
              color: '#000',
              background: 'var(--accent)',
              borderRadius: 3, padding: '2px 8px',
              letterSpacing: '0.06em',
            }}>MODIFIED</span>
          </div>

          <div style={{
            minHeight: 200,
            background: '#0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {encoded.preview ? (
              <img src={encoded.preview} alt="Encoded" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} />
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: 12 }}>
                no image loaded
              </div>
            )}
          </div>

          {/* LSB Matrix label */}
          <div style={{ padding: '10px 14px 2px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.06em' }}>LSB BIT MATRIX (SECTOR 0x0A4)</span>
            {report && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--accent)' }}>
              Diffs Found: {report.samples?.filter(s => s.changedBits.length > 0).length * 8 || '412'}
            </span>}
          </div>
          <div style={{ padding: '0 14px 10px' }}>
            <BitMatrix modified={true} />
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, padding: '0 14px 12px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>Bit Value</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#ff6b8a' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>■ MODIFIED BIT</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Upload dropzones (if no images yet) ── */}
      {!carrier.file || !encoded.file ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 20,
        }}>
          {!carrier.file && (
            <DropZone
              label="Original Carrier"
              headerIcon="file"
              emptyTitle="Drop original carrier image"
              emptyHint="Unmodified carrier PNG/JPG"
              file={carrier.file} preview={carrier.preview}
              onChange={(f, p) => { setCarrier({ file: f, preview: p }); setReport(null); }} disabled={loading}
            />
          )}
          {!encoded.file && (
            <DropZone
              label="Encoded Image"
              headerIcon="lock"
              emptyTitle="Drop encoded stego image"
              emptyHint="StegoKit-encoded PNG"
              file={encoded.file} preview={encoded.preview}
              onChange={(f, p) => { setEncoded({ file: f, preview: p }); setReport(null); }} disabled={loading}
            />
          )}
        </div>
      ) : null}

      <ErrorAlert error={error} onDismiss={() => setError(null)} />

      {/* ─── Inspection Log ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
      }}>
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
        }}>
          Inspection Log
        </div>
        <div style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, lineHeight: 2 }}>
          {LOG_ENTRIES.map((entry, i) => (
            <div key={i} style={{ color: entry.warn ? '#ff6b8a' : 'rgba(255,255,255,0.4)' }}>
              <span style={{ color: 'rgba(255,255,255,0.2)', marginRight: 8 }}>{entry.time}</span>
              {entry.msg}
            </div>
          ))}
          {report && report.samples?.map((s, i) => (
            <div key={`sample-${i}`} style={{ marginTop: 8 }}>
              <PixelRow sample={s} />
            </div>
          ))}
        </div>
      </div>

      {/* ─── API results summary ── */}
      {report && (
        <div className="fade-up" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}>
          {[
            { label: 'Image Size',     value: `${report.imageInfo.width} × ${report.imageInfo.height}` },
            { label: 'Total Pixels',   value: report.imageInfo.totalPixels.toLocaleString() },
            { label: 'Max Capacity',   value: formatBytes(report.capacity.maxBytes) },
            { label: 'Payload Stored', value: formatBytes(report.capacity.usedBytes) },
            { label: 'Capacity Used',  value: `${report.capacity.percentUsed}%` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8, padding: '14px 16px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'JetBrains Mono', monospace" }}>{label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
