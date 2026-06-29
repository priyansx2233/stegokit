import { formatBytes, capacityColor } from '../utils/formatters';

export default function CapacityMeter({ capacity }) {
  if (!capacity) return null;
  const pct   = parseFloat(capacity.percentUsed) || 0;
  const color = capacityColor(pct);

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 8,
      padding: '14px 18px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--text-secondary)' }}>
          Carrier Capacity
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>
          {pct.toFixed(1)}% used
        </span>
      </div>

      {}
      <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{
          height: '100%',
          width: `${Math.min(pct, 100)}%`,
          background: color,
          borderRadius: 3,
          transition: 'width 0.5s ease',
          boxShadow: 'none',
        }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Capacity',  val: formatBytes(capacity.maxBytes) },
          { label: 'Used',      val: formatBytes(capacity.usedBytes) },
          { label: 'Remaining', val: formatBytes(capacity.remainingBytes) },
        ].map(({ label, val }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{val}</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
