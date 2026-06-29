
export default function PrivacyPolicy() {
  const sectionStyle = {
    marginBottom: 40,
  };

  const headingStyle = {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--accent)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 0,
  };

  const paraStyle = {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.75,
    marginTop: 0,
    marginBottom: 12,
  };

  const listStyle = {
    paddingLeft: 20,
    margin: '0 0 12px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  };

  const liStyle = {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.75,
  };

  const dividerStyle = {
    border: 'none',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    margin: '32px 0',
  };

  return (
    <div style={{ minHeight: '80vh', padding: '60px 24px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {}
        <div style={{ marginBottom: 48 }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--accent)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            Legal
          </p>
          <h1 style={{
            fontSize: 36,
            fontWeight: 800,
            color: 'var(--text-primary)',
            margin: '0 0 16px 0',
            lineHeight: 1.15,
          }}>
            Privacy Policy
          </h1>
          <p style={{ ...paraStyle, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            Last updated: June 2026
          </p>
        </div>

        <hr style={dividerStyle} />

        {}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Overview</h2>
          <p style={paraStyle}>
            StegoKit is an open-source steganography toolkit. This policy describes how the
            application handles your data. We are committed to transparency — your files and
            secrets stay with you.
          </p>
        </div>

        {}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Data We Do Not Collect</h2>
          <p style={paraStyle}>
            StegoKit does not collect, store, or transmit any personal data. Specifically:
          </p>
          <ul style={listStyle}>
            <li style={liStyle}>No images or files you upload are retained on any server after your request completes.</li>
            <li style={liStyle}>No passwords or encryption keys are logged or stored.</li>
            <li style={liStyle}>No account registration, tracking cookies, or analytics are used.</li>
            <li style={liStyle}>No personally identifiable information (PII) is collected at any point.</li>
          </ul>
        </div>

        <hr style={dividerStyle} />

        {}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>How Processing Works</h2>
          <p style={paraStyle}>
            All steganography operations (encoding, decoding, encryption, visualization) are
            performed server-side in memory only. Uploaded files are processed and immediately
            discarded — they are never written to persistent storage and are not accessible
            to any third party.
          </p>
          <p style={paraStyle}>
            When you use the self-hosted or local version of StegoKit, all processing happens
            entirely on your own machine and no data ever leaves your device.
          </p>
        </div>

        <hr style={dividerStyle} />

        {}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Third-Party Services</h2>
          <p style={paraStyle}>
            StegoKit does not integrate with any third-party analytics, advertising, or data
            brokerage services. The only external dependency used at runtime is the CDN that
            serves public web fonts (JetBrains Mono via Google Fonts). Google's own privacy
            policy applies to that request.
          </p>
        </div>

        <hr style={dividerStyle} />

        {/* Open Source */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Open Source & Transparency</h2>
          <p style={paraStyle}>
            StegoKit is fully open source. You can audit every line of code that handles your
            data on{' '}
            <a
              href="https://github.com/CodeAurelius0/stegokit"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', textDecoration: 'none' }}
            >
              GitHub
            </a>
            . We encourage independent review and welcome community contributions.
          </p>
        </div>

        <hr style={dividerStyle} />

        {/* Changes */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Changes to This Policy</h2>
          <p style={paraStyle}>
            We may update this policy as the project evolves. Changes will be reflected in the
            "Last updated" date above and committed to the public repository so you can track
            the full history.
          </p>
        </div>

        <hr style={dividerStyle} />

        {/* Contact */}
        <div style={sectionStyle}>
          <h2 style={headingStyle}>Contact</h2>
          <p style={paraStyle}>
            Questions about this policy? Open an issue on the{' '}
            <a
              href="https://github.com/CodeAurelius0/stegokit/issues"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent)', textDecoration: 'none' }}
            >
              GitHub issue tracker
            </a>
            .
          </p>
        </div>

      </div>
    </div>
  );
}
