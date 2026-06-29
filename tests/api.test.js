
'use strict';

const request = require('supertest');
const Jimp    = require('jimp');
const app     = require('../backend/server');

async function makeTestPng(width, height, color = 0x4488ccff) {
  const img = new Jimp(width, height, color);
  return img.getBufferAsync('image/png');
}

function parseBinary(res, cb) {
  const chunks = [];
  res.setEncoding('binary');
  res.on('data', (chunk) => chunks.push(Buffer.from(chunk, 'binary')));
  res.on('end', () => cb(null, Buffer.concat(chunks)));
}

function expectPngResponse(res) {
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/^image\/png/);
  expect(res.body).toBeInstanceOf(Buffer);
  expect(res.body.slice(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
}

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

  test('encodes text and returns a PNG stream', async () => {
    const res = await request(app)
      .post('/api/encode/text')
      .attach('carrier', carrierBuf, { filename: 'carrier.png', contentType: 'image/png' })
      .field('text', 'Hello API!')
      .buffer(true)
      .parse(parseBinary);

    expectPngResponse(res);
    expect(res.headers['x-text-length']).toBe('10');
    expect(res.headers['x-encrypted']).toBe('false');
  });

  test('encode → decode round-trip via API', async () => {
    const text = 'StegoKit API test 🔐';

    const encRes = await request(app)
      .post('/api/encode/text')
      .attach('carrier', carrierBuf, { filename: 'c.png', contentType: 'image/png' })
      .field('text', text)
      .buffer(true)
      .parse(parseBinary);
    expectPngResponse(encRes);

    const decRes = await request(app)
      .post('/api/decode/text')
      .attach('encoded', encRes.body, { filename: 'enc.png', contentType: 'image/png' });
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
      .field('password', pw)
      .buffer(true)
      .parse(parseBinary);
    expectPngResponse(encRes);

    const decRes = await request(app)
      .post('/api/decode/text')
      .attach('encoded', encRes.body, { filename: 'enc.png', contentType: 'image/png' })
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
      .attach('secret',  secretBuf,  { filename: 'secret.png',  contentType: 'image/png' })
      .buffer(true)
      .parse(parseBinary);

    expectPngResponse(res);
    expect(res.headers['x-encrypted']).toBe('false');
  });

  test('encode-image → decode-image round-trip', async () => {
    const encRes = await request(app)
      .post('/api/encode/image')
      .attach('carrier', carrierBuf, { filename: 'carrier.png', contentType: 'image/png' })
      .attach('secret',  secretBuf,  { filename: 'secret.png',  contentType: 'image/png' })
      .buffer(true)
      .parse(parseBinary);
    expectPngResponse(encRes);

    const decRes = await request(app)
      .post('/api/decode/image')
      .attach('encoded', encRes.body, { filename: 'enc.png', contentType: 'image/png' })
      .buffer(true)
      .parse(parseBinary);
    expectPngResponse(decRes);
  });
});

describe('POST /api/encrypt + POST /api/decrypt', () => {
  test('encrypts and decrypts text', async () => {
    const encRes = await request(app)
      .post('/api/encrypt')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ text: 'Hello!', password: 'pw123' }));
    expect(encRes.status).toBe(200);
    expect(encRes.body.data.ciphertext).toBeDefined();

    const decRes = await request(app)
      .post('/api/decrypt')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ ciphertext: encRes.body.data.ciphertext, password: 'pw123' }));
    expect(decRes.status).toBe(200);
    expect(decRes.body.data.text).toBe('Hello!');
  });

  test('returns 401 on wrong password', async () => {
    const encRes = await request(app)
      .post('/api/encrypt')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ text: 'secret', password: 'correct' }));

    const decRes = await request(app)
      .post('/api/decrypt')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ ciphertext: encRes.body.data.ciphertext, password: 'wrong' }));
    expect(decRes.status).toBe(401);
  });
});

describe('POST /api/visualize', () => {
  test('returns visualization report', async () => {
    const carrier = await makeTestPng(200, 200);
    const encRes  = await request(app)
      .post('/api/encode/text')
      .attach('carrier', carrier, { filename: 'c.png', contentType: 'image/png' })
      .field('text', 'Visualization test')
      .buffer(true)
      .parse(parseBinary);
    expectPngResponse(encRes);

    const vizRes = await request(app)
      .post('/api/visualize')
      .attach('carrier', carrier, { filename: 'orig.png', contentType: 'image/png' })
      .attach('encoded', encRes.body, { filename: 'enc.png',  contentType: 'image/png' })
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
