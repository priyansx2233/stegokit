
'use strict';

const aes = require('../backend/encryption/aes');

describe('AES-256-CBC encryption', () => {
  const password  = 'super-secret-password-123!';
  const plaintext = 'Hello, StegoKit AES encryption test! 🔐';

  test('encrypts and decrypts a Buffer correctly', async () => {
    const buf       = Buffer.from(plaintext, 'utf8');
    const encrypted = await aes.encryptBuffer(buf, password);
    const decrypted = await aes.decryptBuffer(encrypted, password);
    expect(decrypted.toString('utf8')).toBe(plaintext);
  });

  test('produces non-deterministic ciphertext (random salt+IV)', async () => {
    const buf = Buffer.from(plaintext, 'utf8');
    const c1  = await aes.encryptBuffer(buf, password);
    const c2  = await aes.encryptBuffer(buf, password);
    expect(c1.equals(c2)).toBe(false);
  });

  test('ciphertext is larger than plaintext (has salt+IV overhead)', async () => {
    const buf       = Buffer.from(plaintext, 'utf8');
    const encrypted = await aes.encryptBuffer(buf, password);

    expect(encrypted.length).toBeGreaterThan(buf.length);
  });

  test('throws on wrong password', async () => {
    const buf       = Buffer.from(plaintext, 'utf8');
    const encrypted = await aes.encryptBuffer(buf, password);
    await expect(aes.decryptBuffer(encrypted, 'wrong-password')).rejects.toThrow();
  });

  test('throws on truncated ciphertext', async () => {
    await expect(aes.decryptBuffer(Buffer.alloc(10), password)).rejects.toThrow(/too short|corrupted/i);
  });

  test('handles empty buffer', async () => {
    const buf       = Buffer.alloc(0);
    const encrypted = await aes.encryptBuffer(buf, password);
    const decrypted = await aes.decryptBuffer(encrypted, password);
    expect(decrypted.length).toBe(0);
  });

  test('encryptText / decryptText round-trip', async () => {
    const cipher = await aes.encryptText(plaintext, password);
    expect(typeof cipher).toBe('string');
    const plain  = await aes.decryptText(cipher, password);
    expect(plain).toBe(plaintext);
  });

  test('encryptText produces valid base64', async () => {
    const cipher = await aes.encryptText('test', password);
    expect(() => Buffer.from(cipher, 'base64')).not.toThrow();
  });

  test('handles Unicode text', async () => {
    const unicode = '日本語テスト 🎌 مرحبا';
    const cipher  = await aes.encryptText(unicode, password);
    const plain   = await aes.decryptText(cipher, password);
    expect(plain).toBe(unicode);
  });

  test('different passwords produce different ciphertexts', async () => {
    const c1 = await aes.encryptText('data', 'password1');
    const c2 = await aes.encryptText('data', 'password2');
    expect(c1).not.toBe(c2);
  });
});
