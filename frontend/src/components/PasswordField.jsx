import { useState } from 'react';

const IconEye = ({ open }) => (
  open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
);

const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export default function PasswordField({
  value,
  onChange,
  label       = 'Encryption Password (Optional)',
  placeholder = 'Enter secure passphrase...',
  hint        = 'Leave blank for unencrypted LSB encoding.',
  showHeader  = true,
  disabled,
}) {
  const [show, setShow] = useState(false);

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 10,
      overflow: 'hidden',
    }}>
      {showHeader && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <IconShield />
          <span style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            Encryption Parameters
          </span>
        </div>
      )}

      <div style={{ padding: '16px 18px' }}>
        {}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <span style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            fontWeight: 400,
          }}>
            {label}
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.6)',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 4,
            padding: '2px 8px',
          }}>
            scrypt
          </span>
        </div>

        {}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="new-password"
            style={{
              width: '100%',
              background: 'var(--bg-base)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              padding: '10px 40px 10px 14px',
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(0,229,195,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.35)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            <IconEye open={show} />
          </button>
        </div>

        {}
        {hint && (
          <p style={{
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            color: 'rgba(255,255,255,0.25)',
            margin: 0,
          }}>
            {hint}
          </p>
        )}
      </div>
    </div>
  );
}
