import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '16px 24px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        {}
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.04em',
        }}>
          v2.4.0-stable&nbsp;|&nbsp;0xDEADBEEF&nbsp;|&nbsp;SECURED SYSTEM
        </span>

        {}
        <div style={{ display: 'flex', gap: 20 }}>
          <a
            href="https://github.com/CodeAurelius0"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.35)',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            Github
          </a>
          <Link
            to="/privacy"
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.35)',
              textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            Privacy Policy
          </Link>
        </div>

        {}
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.15em',
        }}>
          STEGOKIT
        </span>
      </div>
    </footer>
  );
}
