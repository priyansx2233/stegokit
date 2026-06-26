import { formatBytes, capacityColor } from '../utils/formatters';

/**
 * CapacityMeter — shows payload usage relative to carrier capacity.
 * Props: capacity object from API { maxBytes, usedBytes, remainingBytes, percentUsed }
 */
export default function CapacityMeter({ capacity }) {
  if (!capacity) return null;
  const pct   = parseFloat(capacity.percentUsed) || 0;
  const color = capacityColor(pct);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12,
      padding: '14px 18px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#8888a8' }}>
          Carrier Capacity
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>
          {pct.toFixed(1)}% used
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{
          height: '100%',
          width: `${Math.min(pct, 100)}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 0.5s ease',
          boxShadow: `0 0 8px ${color}60`,
        }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Capacity',  val: formatBytes(capacity.maxBytes) },
          { label: 'Used',      val: formatBytes(capacity.usedBytes) },
          { label: 'Remaining', val: formatBytes(capacity.remainingBytes) },
        ].map(({ label, val }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f1f6' }}>{val}</div>
            <div style={{ fontSize: 11, color: '#8888a8', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
