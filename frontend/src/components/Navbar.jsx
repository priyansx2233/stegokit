import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { to: '/',             label: 'Home' },
  { to: '/encode-image', label: 'Hide Image' },
  { to: '/decode-image', label: 'Extract Image' },
  { to: '/encode-text',  label: 'Hide Text' },
  { to: '/decode-text',  label: 'Extract Text' },
  { to: '/visualize',    label: 'Visualize' },
  { to: '/docs',         label: 'Docs' },
];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 200,
      background: 'rgba(14,17,23,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      boxShadow: scrolled ? '0 1px 0 rgba(255,255,255,0.06)' : 'none',
      transition: 'box-shadow 0.2s ease',
    }}>
      <nav style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        height: 56,
      }}>
        {/* Logo wordmark */}
        <NavLink to="/" style={{
          textDecoration: 'none',
          marginRight: 40,
          flexShrink: 0,
          fontWeight: 600,
          fontSize: 16,
          color: '#ffffff',
          letterSpacing: '-0.01em',
        }}>
          StegoKit
        </NavLink>

        {/* Nav links */}
        <div style={{
          display: 'flex',
          gap: 0,
          flex: 1,
          overflow: 'auto',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}>
          {NAV_ITEMS.map(({ to, label }) => {
            const active = location.pathname === to;
            return (
              <NavLink
                key={to}
                to={to}
                style={{
                  position: 'relative',
                  padding: '0 14px',
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 14,
                  fontWeight: 400,
                  color: active ? '#ffffff' : '#8b949e',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                  borderBottom: active ? '2px solid #0098ff' : '2px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#8b949e'; }}
              >
                {label}
              </NavLink>
            );
          })}
        </div>

        {/* Version Badge */}
        <div style={{
          marginLeft: 16,
          padding: '4px 12px',
          background: 'rgba(130,100,250,0.1)',
          border: '1px solid rgba(130,100,250,0.2)',
          borderRadius: 20,
          color: '#a38df5',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          v1.0.0
        </div>
      </nav>
    </header>
  );
}
