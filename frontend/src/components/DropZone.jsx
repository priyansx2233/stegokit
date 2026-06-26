import { useRef, useState, useEffect } from 'react';

/**
 * Drag-and-drop + click-to-browse image uploader.
 * Props:
 *   label        — displayed name
 *   accept       — MIME types string
 *   file         — current File | null (controlled)
 *   preview      — dataURL string | null
 *   onChange     — (file, dataUrl) => void
 *   hint         — optional hint text
 *   disabled     — bool
 */
export default function DropZone({ label, accept = 'image/*', file, preview, onChange, hint, disabled }) {
  const inputRef  = useRef(null);
  const [drag, setDrag]  = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    // Use createObjectURL — instant, zero memory copy, works for any file size
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

  const onInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const zone = {
    border: `2px dashed ${drag ? '#7c6af7' : preview ? '#06d6a0' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 14,
    background: drag ? 'rgba(124,106,247,0.06)' : preview ? 'rgba(6,214,160,0.04)' : 'rgba(255,255,255,0.02)',
    minHeight: 160,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    overflow: 'hidden',
    padding: 16,
  };

  return (
    <div>
      {label && <span className="label">{label}</span>}
      <div
        style={zone}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              style={{
                maxHeight: 200, maxWidth: '100%',
                borderRadius: 10, objectFit: 'contain',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            />
            <div style={{ fontSize: 12, color: '#06d6a0', fontWeight: 600 }}>
              ✓ {file?.name || 'Image loaded'}
              {file && <span style={{ color: '#8888a8', fontWeight: 400 }}>
                {' '}· {(file.size / 1024).toFixed(1)} KB
              </span>}
            </div>
            {!disabled && (
              <span style={{ fontSize: 12, color: '#8888a8' }}>Click to change</span>
            )}
          </>
        ) : (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'rgba(124,106,247,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>🖼️</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#f1f1f6', marginBottom: 4 }}>
                Drop image here
              </div>
              <div style={{ fontSize: 13, color: '#8888a8' }}>or click to browse</div>
              {hint && <div style={{ fontSize: 12, color: '#8888a8', marginTop: 6 }}>{hint}</div>}
            </div>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={onInputChange}
        disabled={disabled}
      />
    </div>
  );
}
