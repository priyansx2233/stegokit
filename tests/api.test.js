/**
 * @file tests/api.test.js
 * @description Integration tests for the StegoKit REST API endpoints.
 *   Uses supertest to exercise all routes end-to-end.
 */
'use strict';

const request = require('supertest');
const Jimp    = require('jimp');
const app     = require('../backend/server');

// ── Helper: generate test PNG buffer ─────────────────────────────────────────
async function makeTestPng(width, height, color = 0x4488ccff) {
  const img = new Jimp(width, height, color);
  return img.getBufferAsync('image/png');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('GET /api/health', () => {
  test('returns 200 with service info', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.service).toBe('StegoKit API');
  });
});

describe('POST /api/encode/text + POST /api/decode/text', () => {
  let carrierBuf;

  beforeAll(async () => {
    carrierBuf = await makeTestPng(300, 300);
  });

  test('encodes text and returns base64 PNG', async () => {
    const res = await request(app)
      .post('/api/encode/text')
      .attach('carrier', carrierBuf, { filename: 'carrier.png', contentType: 'image/png' })
      .field('text', 'Hello API!');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.imageDataUrl).toMatch(/^data:image\/png;base64,/);
    expect(res.body.data.textLength).toBe(10);
    expect(res.body.data.encrypted).toBe(false);
  });

  test('encode → decode round-trip via API', async () => {
    const text = 'StegoKit API test 🔐';

    // Encode
    const encRes = await request(app)
      .post('/api/encode/text')
      .attach('carrier', carrierBuf, { filename: 'c.png', contentType: 'image/png' })
      .field('text', text);
    expect(encRes.status).toBe(200);

    // Extract PNG buffer from base64
    const base64 = encRes.body.data.base64;
    const encBuf = Buffer.from(base64, 'base64');

    // Decode
    const decRes = await request(app)
      .post('/api/decode/text')
      .attach('encoded', encBuf, { filename: 'enc.png', contentType: 'image/png' });
    expect(decRes.status).toBe(200);
    expect(decRes.body.data.text).toBe(text);
  });

  test('encode → decode with password', async () => {
    const text = 'Encrypted payload!';
    const pw   = 'test-pw-456';

    const encRes = await request(app)
      .post('/api/encode/text')
      .attach('carrier', carrierBuf, { filename: 'c.png', contentType: 'image/png' })
      .field('text', text)
      .field('password', pw);
    expect(encRes.status).toBe(200);

    const encBuf = Buffer.from(encRes.body.data.base64, 'base64');

    const decRes = await request(app)
      .post('/api/decode/text')
      .attach('encoded', encBuf, { filename: 'enc.png', contentType: 'image/png' })
      .field('password', pw);
    expect(decRes.status).toBe(200);
    expect(decRes.body.data.text).toBe(text);
  });

  test('returns 400 when text is missing', async () => {
    const res = await request(app)
      .post('/api/encode/text')
      .attach('carrier', carrierBuf, { filename: 'c.png', contentType: 'image/png' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('returns 400 when carrier is missing', async () => {
    const res = await request(app)
      .post('/api/encode/text')
      .field('text', 'no carrier');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/encode/image + POST /api/decode/image', () => {
  let carrierBuf, secretBuf;

  beforeAll(async () => {
    carrierBuf = await makeTestPng(300, 300, 0x224466ff);
    secretBuf  = await makeTestPng(40,  40,  0xcc3355ff);
  });

  test('encodes secret image into carrier', async () => {
    const res = await request(app)
      .post('/api/encode/image')
      .attach('carrier', carrierBuf, { filename: 'carrier.png', contentType: 'image/png' })
      .attach('secret',  secretBuf,  { filename: 'secret.png',  contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.imageDataUrl).toMatch(/^data:image\/png;base64,/);
  });

  test('encode-image → decode-image round-trip', async () => {
    const encRes = await request(app)
      .post('/api/encode/image')
      .attach('carrier', carrierBuf, { filename: 'carrier.png', contentType: 'image/png' })
      .attach('secret',  secretBuf,  { filename: 'secret.png',  contentType: 'image/png' });
    expect(encRes.status).toBe(200);

    const encBuf = Buffer.from(encRes.body.data.base64, 'base64');

    const decRes = await request(app)
      .post('/api/decode/image')
      .attach('encoded', encBuf, { filename: 'enc.png', contentType: 'image/png' });
    expect(decRes.status).toBe(200);
    expect(decRes.body.data.imageDataUrl).toMatch(/^data:image\/png;base64,/);
  });
});

describe('POST /api/encrypt + POST /api/decrypt', () => {
  test('encrypts and decrypts text', async () => {
    const encRes = await request(app)
      .post('/api/encrypt')
      .send(JSON.stringify({ text: 'Hello!', password: 'pw123' }))
      .type('json');
    expect(encRes.status).toBe(200);
    expect(encRes.body.data.ciphertext).toBeDefined();

    const decRes = await request(app)
      .post('/api/decrypt')
      .send(JSON.stringify({ ciphertext: encRes.body.data.ciphertext, password: 'pw123' }))
      .type('json');
    expect(decRes.status).toBe(200);
    expect(decRes.body.data.text).toBe('Hello!');
  });

  test('returns 401 on wrong password', async () => {
    const encRes = await request(app)
      .post('/api/encrypt')
      .send(JSON.stringify({ text: 'secret', password: 'correct' }))
      .type('json');

    const decRes = await request(app)
      .post('/api/decrypt')
      .send(JSON.stringify({ ciphertext: encRes.body.data.ciphertext, password: 'wrong' }))
      .type('json');
    expect(decRes.status).toBe(401);
  });
});

describe('POST /api/visualize', () => {
  test('returns visualization report', async () => {
    const carrier = await makeTestPng(200, 200);
    const encRes  = await request(app)
      .post('/api/encode/text')
      .attach('carrier', carrier, { filename: 'c.png', contentType: 'image/png' })
      .field('text', 'Visualization test');

    const encoded = Buffer.from(encRes.body.data.base64, 'base64');

    const vizRes = await request(app)
      .post('/api/visualize')
      .attach('carrier', carrier, { filename: 'orig.png', contentType: 'image/png' })
      .attach('encoded', encoded, { filename: 'enc.png',  contentType: 'image/png' })
      .field('sampleCount', '8');

    expect(vizRes.status).toBe(200);
    expect(vizRes.body.data).toHaveProperty('samples');
    expect(vizRes.body.data.samples.length).toBeGreaterThan(0);
  });
});

describe('404 handler', () => {
  test('returns 404 for unknown route', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
  });
});
