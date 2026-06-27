const SECTIONS = [
  {
    id: 'overview',
    title: 'What is Steganography?',
    content: `Steganography is the art of hiding information within other information.
Unlike encryption (which scrambles data), steganography conceals the very existence of the message.
StegoKit implements LSB (Least Significant Bit) steganography — the most common digital technique.`,
  },
  {
    id: 'lsb',
    title: 'LSB Algorithm Explained',
    content: `Each pixel in a digital image has 4 channels: Red, Green, Blue, Alpha.
Each channel is an 8-bit integer (0–255).

StegoKit modifies only the Least Significant Bit (bit position 0) of the R, G, B channels.
Changing just the LSB causes at most a ±1 change in the channel value — imperceptible to the human eye.

This gives us 3 bits of hidden data per pixel (R LSB + G LSB + B LSB).

Example: Embedding bit "1" into Red channel 200:
  200 in binary: 11001000
  Set LSB to 1:  11001001 = 201  (change of just 1)`,
    code: true,
  },
  {
    id: 'header',
    title: 'Payload Header',
    content: `The first 32 pixels store a 32-bit header that encodes the payload byte count.
Only the R channel LSB of each pixel is used for the header.

This allows the decoder to know exactly how many bits to extract, preventing over-reading.
The maximum payload size is (totalPixels - 32) × 3 / 8 bytes.`,
  },
  {
    id: 'capacity',
    title: 'Capacity Calculation',
    content: `Capacity (bytes) = floor((totalPixels − 32) × 3 / 8)

Example — 1920×1080 image:
  Total pixels  = 2,073,600
  Header pixels = 32
  Data pixels   = 2,073,568
  Available bits = 6,220,704
  Capacity       = 777,588 bytes ≈ 759 KB`,
    code: true,
  },
  {
    id: 'encryption',
    title: 'AES-256 Encryption',
    content: `Before embedding, StegoKit can optionally encrypt the payload:

  1. Password → 32-byte key via scrypt(N=16384, r=8, p=1)
  2. Random 16-byte salt generated
  3. Random 16-byte IV generated
  4. AES-256-CBC encryption applied
  5. Output = [salt(16)] + [IV(16)] + [ciphertext]
  6. This encrypted buffer is then embedded via LSB

On decoding, the process is reversed: extract → decrypt → interpret.`,
    code: true,
  },
  {
    id: 'api',
    title: 'REST API Reference',
    endpoints: [
      { method: 'POST', path: '/api/encode/image', desc: 'Hide image in carrier', body: 'carrier (file), secret (file), password? (text)' },
      { method: 'POST', path: '/api/decode/image', desc: 'Extract hidden image',  body: 'encoded (file), password? (text)' },
      { method: 'POST', path: '/api/encode/text',  desc: 'Hide text in carrier',  body: 'carrier (file), text (string), password? (text)' },
      { method: 'POST', path: '/api/decode/text',  desc: 'Extract hidden text',   body: 'encoded (file), password? (text)' },
      { method: 'POST', path: '/api/visualize',    desc: 'Pixel-level report',    body: 'carrier (file), encoded (file), sampleCount? (number)' },
      { method: 'POST', path: '/api/encrypt',      desc: 'AES-256 encrypt text',  body: 'JSON: { text, password }' },
      { method: 'POST', path: '/api/decrypt',      desc: 'AES-256 decrypt text',  body: 'JSON: { ciphertext, password }' },
      { method: 'GET',  path: '/api/health',       desc: 'API health check',      body: '—' },
    ],
  },
  {
    id: 'cli',
    title: 'CLI Usage',
    commands: [
      { cmd: 'stego encode-image -c cover.png -s secret.png -o result.png', desc: 'Hide image in image' },
      { cmd: 'stego encode-image -c cover.png -s secret.png -o result.png -p mypassword', desc: 'With AES-256 encryption' },
      { cmd: 'stego decode-image -i result.png -o recovered.png', desc: 'Extract hidden image' },
      { cmd: 'stego decode-image -i result.png -o recovered.png -p mypassword', desc: 'Decrypt and extract' },
      { cmd: 'stego encode-text -c cover.png -t "Secret msg" -o encoded.png', desc: 'Hide inline text' },
      { cmd: 'stego encode-text -c cover.png -f message.txt -o encoded.png', desc: 'Hide text from file' },
      { cmd: 'stego decode-text -i encoded.png', desc: 'Extract text to stdout' },
      { cmd: 'stego decode-text -i encoded.png -o output.txt', desc: 'Extract text to file' },
      { cmd: 'stego visualize -c original.png -e encoded.png -n 20', desc: 'Visualize 20 pixel samples' },
    ],
  },
];

export default function Docs() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <h1 style={{
          fontSize: 'clamp(2.2rem, 4vw, 3rem)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: '#ffffff',
          marginBottom: 8,
        }}>
          Documentation
        </h1>
        <p style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.65,
        }}>
          Technical reference for StegoKit's steganography algorithms, API, and CLI.
        </p>
      </div>

      {/* Table of contents */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 36,
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: 12,
        }}>
          Contents
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`}
              style={{
                fontSize: 12,
                color: 'var(--accent)',
                textDecoration: 'none',
                padding: '4px 10px',
                background: 'rgba(0,229,195,0.07)',
                border: '1px solid rgba(0,229,195,0.15)',
                borderRadius: 5,
                fontFamily: "'JetBrains Mono', monospace",
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(0,229,195,0.14)';
                e.currentTarget.style.borderColor = 'rgba(0,229,195,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(0,229,195,0.07)';
                e.currentTarget.style.borderColor = 'rgba(0,229,195,0.15)';
              }}
            >
              {s.title}
            </a>
          ))}
        </div>
      </div>

      {SECTIONS.map((s) => (
        <div key={s.id} id={s.id} style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: '#ffffff',
            marginBottom: 14,
            paddingTop: 4,
          }}>
            {s.title}
          </h2>

          {s.content && (
            <div style={{
              background: s.code ? '#080808' : 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8,
              padding: '18px 20px',
            }}>
              <pre style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.75,
                fontSize: s.code ? 13 : 14,
                fontFamily: s.code ? "'JetBrains Mono', monospace" : 'inherit',
                color: s.code ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.6)',
              }}>
                {s.content}
              </pre>
            </div>
          )}

          {s.endpoints && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {s.endpoints.map((ep) => (
                <div key={ep.path} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8,
                  padding: '12px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      background: ep.method === 'GET' ? 'rgba(0,229,195,0.12)' : 'rgba(77,159,255,0.12)',
                      color: ep.method === 'GET' ? 'var(--accent)' : '#4d9fff',
                      border: `1px solid ${ep.method === 'GET' ? 'rgba(0,229,195,0.2)' : 'rgba(77,159,255,0.2)'}`,
                    }}>
                      {ep.method}
                    </span>
                    <code style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.85)',
                    }}>
                      {ep.path}
                    </code>
                    <span style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.35)',
                      marginLeft: 'auto',
                    }}>
                      {ep.desc}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.3)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    Body: {ep.body}
                  </div>
                </div>
              ))}
            </div>
          )}

          {s.commands && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {s.commands.map((c, i) => (
                <div key={i} style={{
                  background: '#080808',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 8,
                  padding: '12px 16px',
                }}>
                  <code style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    color: 'var(--accent)',
                    display: 'block',
                    marginBottom: 4,
                  }}>
                    $ {c.cmd}
                  </code>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{c.desc}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{
            height: 1,
            background: 'rgba(255,255,255,0.05)',
            marginTop: 32,
          }} />
        </div>
      ))}
    </div>
  );
}
