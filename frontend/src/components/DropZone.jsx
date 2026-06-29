import { useRef, useState } from 'react';

const IconUpload = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const IconFile = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
    <polyline points="13 2 13 9 20 9"/>
    <line x1="8" y1="13" x2="16" y2="13"/>
    <line x1="8" y1="17" x2="12" y2="17"/>
  </svg>
);

const IconLock = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function DropZone({
  label,
  headerIcon = 'file',
  emptyTitle = 'Drag & drop image',
  emptyHint  = 'PNG, JPG up to 10MB',
  accept     = 'image/*',
  file,
  preview,
  onChange,
  disabled,
  variant    = 'default',
}) {
  const inputRef = useRef(null);
  const [drag, setDrag]  = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    onChange(f, url);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const HeaderIcon = headerIcon === 'lock' ? IconLock : headerIcon === 'upload' ? IconUpload : IconFile;

  const isLarge = variant === 'large';

  if (isLarge) {
    return (
      <div
        style={{
          border: `2px solid ${drag ? 'rgba(0,229,195,0.9)' : preview ? 'rgba(0,229,195,0.6)' : 'rgba(0,229,195,0.5)'}`,
          borderRadius: 10,
          background: drag ? 'rgba(0,229,195,0.04)' : 'transparent',
          padding: 32,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 240,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          textAlign: 'center',
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              style={{
                maxHeight: 160, maxWidth: '100%',
                borderRadius: 8, objectFit: 'contain',
                marginBottom: 12,
              }}
            />
            <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>
              {file?.name || 'Image loaded'}
            </div>
            {file && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {(file.size / 1024).toFixed(1)} KB — click to change
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>
              <IconUpload />
            </div>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: 10,
            }}>
              {emptyTitle}
            </div>
            <div style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.4)',
              lineHeight: 1.6,
              marginBottom: 20,
              maxWidth: 340,
            }}>
              {emptyHint}
            </div>
            <button
              type="button"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 5,
                color: 'var(--text-secondary)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '9px 20px',
                cursor: 'pointer',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Browse Files
            </button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          disabled={disabled}
        />
      </div>
    );
  }

  return (
    <div className="upload-card">
      {}
      <div className="upload-card-header">
        <span className="upload-card-label">{label}</span>
        <div style={{ color: 'rgba(255,255,255,0.25)' }}>
          <HeaderIcon />
        </div>
      </div>

      {}
      <div
        className="upload-card-body"
        style={{
          border: `1px dashed ${drag ? 'var(--accent)' : preview ? 'rgba(0,229,195,0.4)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: 8,
          background: drag ? 'rgba(0,229,195,0.04)' : 'var(--bg-base)',
          minHeight: 180,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          textAlign: 'center',
          padding: 20,
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              style={{
                maxHeight: 160, maxWidth: '100%',
                borderRadius: 6, objectFit: 'contain',
              }}
            />
            <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
              {file?.name || 'Image loaded'}
              {file && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                {' '}· {(file.size / 1024).toFixed(1)} KB
              </span>}
            </div>
            {!disabled && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Click to change</div>
            )}
          </>
        ) : (
          <>
            <div style={{ color: 'rgba(255,255,255,0.2)' }}>
              <HeaderIcon />
            </div>
            <div>
              <div style={{
                fontWeight: 500,
                fontSize: 14,
                color: 'rgba(255,255,255,0.7)',
                marginBottom: 6,
              }}>
                {emptyTitle}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: 'rgba(255,255,255,0.3)',
              }}>
                {emptyHint}
              </div>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        disabled={disabled}
      />
    </div>
  );
}
