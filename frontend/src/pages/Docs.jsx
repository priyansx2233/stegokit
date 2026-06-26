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
      <div className="fade-up">
        <h1 className="section-title">📖 Documentation</h1>
        <p className="section-subtitle">
          Technical reference for StegoKit's steganography algorithms, API, and CLI.
        </p>
      </div>

      {/* Table of contents */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div className="label">Contents</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`}
              style={{ fontSize: 13, color: '#7c6af7', textDecoration: 'none', padding: '4px 10px', background: 'rgba(124,106,247,0.1)', borderRadius: 6 }}>
              {s.title}
            </a>
          ))}
        </div>
      </div>

      {SECTIONS.map((s) => (
        <div key={s.id} id={s.id} style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 16, paddingTop: 8 }}>
            {s.title}
          </h2>

          {s.content && (
            <div className="card" style={{ background: s.code ? 'rgba(0,0,0,0.35)' : undefined }}>
              <pre style={{
                margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7,
                fontSize: s.code ? 13 : 15,
                fontFamily: s.code ? "'JetBrains Mono', monospace" : 'inherit',
                color: '#d0d0d8',
              }}>{s.content}</pre>
            </div>
          )}

          {s.endpoints && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {s.endpoints.map((ep) => (
                <div key={ep.path} className="card" style={{ padding: '14px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span className={`badge ${ep.method === 'GET' ? 'badge-green' : 'badge-purple'}`}>
                      {ep.method}
                    </span>
                    <code style={{ fontFamily: 'monospace', fontSize: 14, color: '#f1f1f6' }}>{ep.path}</code>
                    <span style={{ fontSize: 13, color: '#8888a8', marginLeft: 'auto' }}>{ep.desc}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#8888a8' }}>
                    <strong>Body:</strong> {ep.body}
                  </div>
                </div>
              ))}
            </div>
          )}

          {s.commands && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {s.commands.map((c, i) => (
                <div key={i} className="card" style={{ padding: '12px 18px', background: 'rgba(0,0,0,0.3)' }}>
                  <code style={{ fontFamily: 'monospace', fontSize: 13, color: '#06d6a0', display: 'block', marginBottom: 4 }}>
                    $ {c.cmd}
                  </code>
                  <span style={{ fontSize: 12, color: '#8888a8' }}>{c.desc}</span>
                </div>
              ))}
            </div>
          )}

          <div className="divider" style={{ marginTop: 28 }} />
        </div>
      ))}
    </div>
  );
}
