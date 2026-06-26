/**
 * @file tests/steganography.test.js
 * @description Unit tests for the core steganography engine.
 *   Tests LSB encode/decode round-trips for both image and text payloads,
 *   capacity calculation, and error cases.
 */
'use strict';

const path   = require('path');
const Jimp   = require('jimp');
const engine = require('../backend/steganography/engine');
const binary = require('../backend/utils/binary');

// ── Helper: create an in-memory PNG buffer of a solid-colour image ───────────
async function makeTestImage(width, height, color = 0x4488ccff) {
  const img = new Jimp(width, height, color);
  return img.getBufferAsync('image/png');
}

// ────────────────────────────────────────────────────────────────────────────

describe('binary utilities', () => {
  test('intToBinary pads correctly', () => {
    expect(binary.intToBinary(65, 8)).toBe('01000001');
    expect(binary.intToBinary(0, 8)).toBe('00000000');
    expect(binary.intToBinary(255, 8)).toBe('11111111');
  });

  test('binaryToInt reverses intToBinary', () => {
    expect(binary.binaryToInt('01000001')).toBe(65);
    expect(binary.binaryToInt('11111111')).toBe(255);
  });

  test('textToBinary / binaryToText round-trip', () => {
    const text  = 'Hello, StegoKit! 🔐';
    const bits  = binary.textToBinary(text);
    expect(bits.length % 8).toBe(0);
    const back  = binary.binaryToText(bits);
    expect(back).toBe(text);
  });

  test('bufferToBinary / binaryToBuffer round-trip', () => {
    const original = Buffer.from([72, 101, 108, 108, 111]);
    const bits = binary.bufferToBinary(original);
    const back = binary.binaryToBuffer(bits);
    expect(back).toEqual(original);
  });

  test('getLSB / setLSB', () => {
    expect(binary.getLSB(200)).toBe(0);
    expect(binary.getLSB(201)).toBe(1);
    expect(binary.setLSB(200, 1)).toBe(201);
    expect(binary.setLSB(201, 0)).toBe(200);
    expect(binary.setLSB(200, 0)).toBe(200);
  });

  test('encodeLength / decodeLength round-trip', () => {
    const values = [0, 1, 42, 1000, 999999, 2 ** 31 - 1];
    for (const v of values) {
      expect(binary.decodeLength(binary.encodeLength(v))).toBe(v >>> 0);
    }
  });
});

// ────────────────────────────────────────────────────────────────────────────

describe('calculateCapacity', () => {
  test('returns correct capacity for small image', async () => {
    const buf = await makeTestImage(100, 100);
    const cap = await engine.calculateCapacity(buf, 0);
    expect(cap.width).toBe(100);
    expect(cap.height).toBe(100);
    expect(cap.totalPixels).toBe(10000);
    // (10000 - 32) * 3 / 8 = 3738
    expect(cap.maxBytes).toBe(Math.floor((10000 - 32) * 3 / 8));
    expect(cap.usedBytes).toBe(0);
  });

  test('returns percentUsed for given payload', async () => {
    const buf = await makeTestImage(200, 200);
    const cap = await engine.calculateCapacity(buf, 100);
    expect(parseFloat(cap.percentUsed)).toBeGreaterThan(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────

describe('encodeText / decodeText', () => {
  let carrierBuf;

  beforeAll(async () => {
    // 400×400 gives ~60 KB capacity — enough for all text tests
    carrierBuf = await makeTestImage(400, 400);
  });

  test('round-trips ASCII text', async () => {
    const text    = 'Hello, World!';
    const encoded = await engine.encodeText(carrierBuf, text);
    const decoded = await engine.decodeText(encoded);
    expect(decoded).toBe(text);
  });

  test('round-trips multi-line text', async () => {
    const text    = 'Line one\nLine two\nLine three\nSpecial: &<>"\'';
    const encoded = await engine.encodeText(carrierBuf, text);
    const decoded = await engine.decodeText(encoded);
    expect(decoded).toBe(text);
  });

  test('round-trips Unicode text', async () => {
    const text    = '秘密のメッセージ 🔐🌍 مرحبا';
    const encoded = await engine.encodeText(carrierBuf, text);
    const decoded = await engine.decodeText(encoded);
    expect(decoded).toBe(text);
  });

  test('round-trips text with AES-256 encryption', async () => {
    const text     = 'Encrypted secret!';
    const password = 'test-password-123';
    const encoded  = await engine.encodeText(carrierBuf, text, { password });
    const decoded  = await engine.decodeText(encoded, { password });
    expect(decoded).toBe(text);
  });

  test('throws with wrong decryption password', async () => {
    const encoded = await engine.encodeText(carrierBuf, 'secret', { password: 'correct' });
    await expect(engine.decodeText(encoded, { password: 'wrong' })).rejects.toThrow();
  });

  test('throws on non-existent payload', async () => {
    // A fresh image with no payload (header = 0)
    const freshBuf = await makeTestImage(50, 50, 0xff0000ff);
    await expect(engine.decodeText(freshBuf)).rejects.toThrow(/no valid steganographic/i);
  });

  test('throws when text exceeds carrier capacity', async () => {
    const tinyBuf = await makeTestImage(10, 10);
    const bigText = 'A'.repeat(10000);
    await expect(engine.encodeText(tinyBuf, bigText)).rejects.toThrow(/too long/i);
  });

  test('throws on empty text', async () => {
    await expect(engine.encodeText(carrierBuf, '')).rejects.toThrow();
  });
});

// ────────────────────────────────────────────────────────────────────────────

describe('encodeImage / decodeImage', () => {
  let carrierBuf;
  let secretBuf;

  beforeAll(async () => {
    carrierBuf = await makeTestImage(300, 300, 0x224466ff);
    secretBuf  = await makeTestImage(40, 40,  0xcc3355ff); // tiny secret
  });

  test('round-trips a secret image', async () => {
    const encoded   = await engine.encodeImage(carrierBuf, secretBuf);
    const recovered = await engine.decodeImage(encoded);
    // Recovered must be a valid PNG buffer
    expect(recovered).toBeInstanceOf(Buffer);
    expect(recovered.slice(0, 8).toString('hex')).toBe('89504e470d0a1a0a');

    // Dimensions should match
    const img = await Jimp.read(recovered);
    expect(img.bitmap.width).toBe(40);
    expect(img.bitmap.height).toBe(40);
  });

  test('round-trips with encryption', async () => {
    const pw      = 'image-password';
    const encoded  = await engine.encodeImage(carrierBuf, secretBuf, { password: pw });
    const recovered = await engine.decodeImage(encoded, { password: pw });
    const img = await Jimp.read(recovered);
    expect(img.bitmap.width).toBe(40);
    expect(img.bitmap.height).toBe(40);
  });

  test('throws on wrong decryption password', async () => {
    const encoded = await engine.encodeImage(carrierBuf, secretBuf, { password: 'correct' });
    await expect(engine.decodeImage(encoded, { password: 'wrong' })).rejects.toThrow();
  });

  test('throws when secret image too large for carrier', async () => {
    const tinyCarrier = await makeTestImage(20, 20);
    const bigSecret   = await makeTestImage(200, 200);
    await expect(engine.encodeImage(tinyCarrier, bigSecret)).rejects.toThrow(/carrier too small/i);
  });
});

// ────────────────────────────────────────────────────────────────────────────

describe('visualize', () => {
  test('returns a valid report structure', async () => {
    const carrier = await makeTestImage(100, 100);
    const encoded = await engine.encodeText(carrier, 'Hello!');
    const report  = await engine.visualize(carrier, encoded, { sampleCount: 8 });

    expect(report).toHaveProperty('imageInfo');
    expect(report).toHaveProperty('capacity');
    expect(report).toHaveProperty('headerBits');
    expect(report.headerBits).toHaveLength(32);
    expect(report).toHaveProperty('samples');
    expect(Array.isArray(report.samples)).toBe(true);
    expect(report.samples.length).toBeGreaterThan(0);

    const s = report.samples[0];
    expect(s).toHaveProperty('original');
    expect(s).toHaveProperty('encoded');
    expect(s).toHaveProperty('changedBits');
  });
});
