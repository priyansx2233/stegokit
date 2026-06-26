import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

function useScrollReveal() {
  const observed = useRef(false);
  useEffect(() => {
    if (observed.current) return;
    observed.current = true;
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.animate-on-scroll').forEach(el => io.observe(el));
    document.querySelectorAll('.stagger-grid > *').forEach((el, i) => {
      el.style.transitionDelay = `${i * 80}ms`;
    });
    return () => io.disconnect();
  }, []);
}

const STEPS = [
  { num: '01', title: 'Upload Carrier',  desc: 'Drop any PNG/JPG as your cover image.' },
  { num: '02', title: 'Add Payload',     desc: 'Choose a secret image or type your text.' },
  { num: '03', title: 'Encode',          desc: 'Engine embeds data invisibly via LSB.' },
  { num: '04', title: 'Download',        desc: 'Get your encoded image, visually identical.' },
];

const FEATURES = [
  { icon: '🖼️', name: 'Hide Image in Image',    desc: 'Embed a secret PNG inside any carrier image using LSB pixel manipulation across RGB channels.' },
  { icon: '🔍', name: 'Extract Hidden Image',   desc: 'Recover a hidden image from an encoded carrier with optional AES-256 decryption.' },
  { icon: '✍️', name: 'Hide Text in Image',    desc: 'Encode any UTF-8 text — including Unicode — invisibly inside a carrier image.' },
  { icon: '📄', name: 'Extract Hidden Text',    desc: 'Decode and recover hidden text from any StegoKit-encoded image.' },
  { icon: '📊', name: 'Visualize LSB Changes',  desc: 'Inspect pixel-level bit changes and understand exactly how steganography works.' },
  { icon: '🔒', name: 'AES-256 Encryption',     desc: 'Optionally encrypt your payload with AES-256-CBC before embedding for double security.' },
];

export default function Home() {
  useScrollReveal();

  return (
    <div style={{ overflow: 'hidden', paddingBottom: 60 }}>
      {/* ═══════════════ HERO ═══════════════ */}
      <section style={{ padding: '120px 24px 80px', textAlign: 'center' }}>
        <div className="container-vsc" style={{ maxWidth: 800 }}>
          
          <div className="animate-on-scroll" style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{ background: 'rgba(130,100,250,0.15)', color: '#b39bf5', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Open Source</span>
            <span style={{ background: 'rgba(40,202,65,0.15)', color: '#4ade80', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>AES-256</span>
            <span style={{ background: 'rgba(255,150,0,0.15)', color: '#fbbf24', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>LSB Engine</span>
          </div>

          <h1 className="animate-on-scroll" style={{
            fontSize: 'clamp(3rem, 6vw, 4.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: '#ffffff',
            margin: '0 0 24px',
            background: 'linear-gradient(135deg, #ffffff 0%, #b3c2ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Hide Data Inside<br />Plain Sight
          </h1>

          <p className="animate-on-scroll" style={{
            color: '#8b949e',
            fontSize: '1.15rem',
            fontWeight: 400,
            lineHeight: 1.6,
            margin: '0 auto 40px',
            maxWidth: 600,
          }}>
            StegoKit is a production-grade steganography toolkit. Hide images and text inside carrier images using LSB encoding — with optional AES-256 encryption.
          </p>

          <div className="animate-on-scroll" style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link to="/encode-image" className="btn" style={{ background: 'linear-gradient(135deg, #7e5cff 0%, #5b3ce8 100%)', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🖼️</span> Hide an Image
            </Link>
            <Link to="/encode-text" className="btn" style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>✍️</span> Hide Text
            </Link>
            <Link to="/visualize" className="btn" style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>📊</span> Visualize
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section style={{ padding: '60px 24px' }}>
        <div className="container-vsc">
          <h2 className="animate-on-scroll" style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 600, color: '#ffffff', marginBottom: 48 }}>How It Works</h2>
          
          <div className="stagger-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
          }}>
            {STEPS.map(step => (
              <div key={step.num} className="card-glass animate-on-scroll" style={{ padding: '36px 24px', textAlign: 'center', background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#3d444d', marginBottom: 20 }}>{step.num}</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: '#ffffff', marginBottom: 12 }}>{step.title}</div>
                <div style={{ fontSize: 14, color: '#8b949e', lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section style={{ padding: '60px 24px' }}>
        <div className="container-vsc">
          <h2 className="animate-on-scroll" style={{ textAlign: 'center', fontSize: '2.2rem', fontWeight: 600, color: '#ffffff', marginBottom: 48 }}>Features</h2>
          
          <div className="stagger-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {FEATURES.map(f => (
              <div key={f.name} className="card-glass animate-on-scroll" style={{ padding: '36px 32px', background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16 }}>
                <div style={{ width: 44, height: 44, background: '#21262d', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 24 }}>
                  {f.icon}
                </div>
                <div style={{ fontSize: 17, fontWeight: 600, color: '#ffffff', marginBottom: 12 }}>{f.name}</div>
                <div style={{ fontSize: 14, color: '#8b949e', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer style={{ padding: '80px 24px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, color: '#484f58', marginBottom: 10 }}>Built with Node.js · Express · React · Jimp · AES-256</div>
        <div style={{ fontSize: 14, color: '#484f58' }}>StegoKit v1.0.0 — Educational & Production-Ready</div>
      </footer>
    </div>
  );
}
