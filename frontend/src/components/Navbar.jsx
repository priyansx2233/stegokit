import { NavLink, useLocation } from 'react-router-dom';

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

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 200,
      background: 'rgba(10, 10, 10, 0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <nav style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        height: 48,
      }}>
        {/* Logo */}
        <NavLink to="/" style={{
          textDecoration: 'none',
          marginRight: 32,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        }}>
          {/* Small icon box */}
          <div style={{
            width: 22,
            height: 22,
            background: 'var(--bg-elevated)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
          </div>
          <span style={{
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            StegoKit
          </span>
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
            const active = to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);

            return (
              <NavLink
                key={to}
                to={to}
                style={{
                  position: 'relative',
                  padding: '0 14px',
                  height: 48,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#ffffff' : 'rgba(255,255,255,0.45)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.15s',
                  borderBottom: active
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                  marginBottom: -1,
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
                }}
              >
                {label}
              </NavLink>
            );
          })}
        </div>


      </nav>
    </header>
  );
}
