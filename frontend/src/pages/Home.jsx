import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';



/* ─── Terminal animation log lines ─────────────────────────── */
const LOG_LINES = [
  { text: '> initializing payload...', color: 'var(--text-secondary)' },
  { text: '> encoding bits...',         color: 'var(--text-secondary)' },
  { text: '> success.',                 color: 'var(--accent)', bold: true },
];

/* ─── Bit blocks for Secure Encryption card ─────────────────── */
function BitBlocks() {
  const blocks = [
    { color: 'var(--accent)' },
    { color: '#2a2a2a' },
    { color: 'var(--accent)' },
    { color: 'var(--accent)' },
    { color: '#2a2a2a' },
    { color: 'var(--accent)' },
  ];
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {blocks.map((b, i) => (
        <div key={i} style={{
          width: 28,
          height: 28,
          borderRadius: 4,
          background: b.color,
          opacity: b.color === '#2a2a2a' ? 1 : 0.9,
        }} />
      ))}
    </div>
  );
}

export default function Home() {

  return (
    <div style={{ overflow: 'hidden' }}>

      {/* ═══════════════════════════════════════════
          HERO
          ═══════════════════════════════════════════ */}
      <section style={{
        padding: '100px 24px 80px',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div className="container-vsc" style={{ maxWidth: 700 }}>

          <h1 className="fade-up" style={{
            fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            color: '#ffffff',
            margin: '0 0 20px',
          }}>
            Invisible Information.
          </h1>

          <p className="fade-up" style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '1.05rem',
            fontWeight: 400,
            lineHeight: 1.7,
            margin: '0 auto 40px',
            maxWidth: 540,
          }}>
            Professional-grade LSB steganography for secure data embedding. Hide
            secrets in plain sight.
          </p>

          <div className="fade-up" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <Link
              to="/encode-image"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                background: 'transparent',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'border-color 0.2s, background 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.9)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Get Started
            </Link>
            <Link
              to="/docs"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                background: 'transparent',
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 400,
                textDecoration: 'none',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURE CARDS — two column row
          ═══════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 28px' }}>
        <div className="container-vsc">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
          }}>

            {/* Card 1: Image-in-Image */}
            <div className="fade-up" style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              padding: '28px',
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Module tag */}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--accent)',
                letterSpacing: '0.06em',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span style={{ fontSize: 9 }}>■</span>
                SYS.MOD.IMG_HIDE
              </div>

              <h2 style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                marginBottom: 12,
                lineHeight: 1.15,
              }}>
                Image-in-Image
              </h2>

              <p style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.65,
                marginBottom: 28,
              }}>
                Embed high-resolution images within ordinary cover files using advanced Least Significant
                Bit algorithms. Undetectable by standard forensic tools.
              </p>

              {/* Visual demo: lock → arrow → image */}
              <div style={{
                marginTop: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}>
                {/* Lock box */}
                <div style={{
                  width: 52,
                  height: 52,
                  background: 'var(--bg-elevated)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>

                {/* Arrow */}
                <div style={{ color: 'var(--accent)', fontSize: 20, lineHeight: 1 }}>→</div>

                {/* Image thumbnail placeholder */}
                <div style={{
                  width: 52,
                  height: 52,
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.12)',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {/* Pixel grid pattern to simulate an image */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 1,
                    padding: 4,
                    width: '100%',
                    height: '100%',
                  }}>
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} style={{
                        borderRadius: 1,
                        background: i % 3 === 0 ? '#2a4a7a' : i % 5 === 0 ? '#1a3a5a' : '#0f2a45',
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Text-in-Image */}
            <div className="fade-up" style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              padding: '28px',
              minHeight: 280,
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Module tag */}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--accent)',
                letterSpacing: '0.06em',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span style={{ fontSize: 9 }}>≡</span>
                SYS.MOD.TXT_HIDE
              </div>

              <h2 style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                marginBottom: 12,
                lineHeight: 1.15,
              }}>
                Text-in-Image
              </h2>

              <p style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.65,
                marginBottom: 28,
              }}>
                Conceal encrypted text payloads within the pixel data of innocent-looking images.
              </p>

              {/* Terminal log */}
              <div style={{
                marginTop: 'auto',
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8,
                padding: '14px 16px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                lineHeight: 2,
              }}>
                {LOG_LINES.map((line, i) => (
                  <div key={i} style={{
                    color: line.color,
                    fontWeight: line.bold ? 600 : 400,
                    display: 'block',
                  }}>
                    {line.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECURE ENCRYPTION — full-width card
          ═══════════════════════════════════════════ */}
      <section style={{ padding: '0 24px 60px' }}>
        <div className="container-vsc">
          <div className="fade-up" style={{
            background: 'var(--bg-card)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12,
            padding: '36px 36px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 32,
            flexWrap: 'wrap',
          }}>
            <div style={{ flex: '1 1 360px' }}>
              {/* Module tag */}
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--accent)',
                letterSpacing: '0.06em',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
                <span style={{ fontSize: 9 }}>◎</span>
                SYS.CORE.CRYPT
              </div>

              <h2 style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                marginBottom: 14,
                lineHeight: 1.15,
              }}>
                Secure Encryption
              </h2>

              <p style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.45)',
                lineHeight: 1.65,
                maxWidth: 520,
              }}>
                All embedded payloads are pre-encrypted using AES-256 before being injected into the
                cover medium. Even if the steganography is detected, the payload remains unreadable
                without the cryptographic key.
              </p>
            </div>

            {/* Right — bit visualization */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              paddingTop: 8,
            }}>
              <BitBlocks />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
