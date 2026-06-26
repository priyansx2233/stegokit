/**
 * @file aes.js
 * @description AES-256-CBC encryption/decryption using Node.js built-in `crypto`.
 *   Password is stretched to a 256-bit key with scrypt (PBKDF2-compatible).
 *   The IV (16 bytes) is prepended to every ciphertext buffer.
 */

'use strict';

const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY_LEN   = 32; // 256 bits
const IV_LEN    = 16; // 128 bits (AES block size)
const SALT_LEN  = 16;

// scrypt cost parameters – tuned for fast-but-secure interactive use
const SCRYPT_N  = 16384;
const SCRYPT_R  = 8;
const SCRYPT_P  = 1;

/**
 * Derive a 256-bit key from a password and salt using scrypt.
 * @param {string} password
 * @param {Buffer} salt - 16-byte random salt.
 * @returns {Promise<Buffer>} 32-byte key.
 */
async function deriveKey(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      KEY_LEN,
      { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P },
      (err, key) => (err ? reject(err) : resolve(key))
    );
  });
}

/**
 * Encrypt a Buffer with AES-256-CBC.
 * Output layout: [salt(16)] [iv(16)] [ciphertext...]
 *
 * @param {Buffer} plaintext - Data to encrypt.
 * @param {string} password  - User-supplied password.
 * @returns {Promise<Buffer>} Encrypted buffer.
 */
async function encryptBuffer(plaintext, password) {
  const salt = crypto.randomBytes(SALT_LEN);
  const iv   = crypto.randomBytes(IV_LEN);
  const key  = await deriveKey(password, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return Buffer.concat([salt, iv, encrypted]);
}

/**
 * Decrypt a Buffer produced by `encryptBuffer`.
 *
 * @param {Buffer} ciphertext - Encrypted buffer (with salt+iv prefix).
 * @param {string} password   - Must match the password used during encryption.
 * @returns {Promise<Buffer>} Decrypted plaintext buffer.
 * @throws {Error} If decryption fails (wrong password / corrupted data).
 */
async function decryptBuffer(ciphertext, password) {
  if (ciphertext.length < SALT_LEN + IV_LEN + 1) {
    throw new Error('Encrypted data is too short or corrupted.');
  }

  const salt       = ciphertext.slice(0, SALT_LEN);
  const iv         = ciphertext.slice(SALT_LEN, SALT_LEN + IV_LEN);
  const encrypted  = ciphertext.slice(SALT_LEN + IV_LEN);
  const key        = await deriveKey(password, salt);

  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  } catch {
    throw new Error('Decryption failed – incorrect password or corrupted payload.');
  }
}

/**
 * Encrypt a UTF-8 string, return base64-encoded ciphertext.
 * @param {string} text
 * @param {string} password
 * @returns {Promise<string>} Base64 string.
 */
async function encryptText(text, password) {
  const buf = await encryptBuffer(Buffer.from(text, 'utf8'), password);
  return buf.toString('base64');
}

/**
 * Decrypt a base64-encoded ciphertext back to a UTF-8 string.
 * @param {string} base64Ciphertext
 * @param {string} password
 * @returns {Promise<string>}
 */
async function decryptText(base64Ciphertext, password) {
  const buf    = Buffer.from(base64Ciphertext, 'base64');
  const plain  = await decryptBuffer(buf, password);
  return plain.toString('utf8');
}

module.exports = {
  encryptBuffer,
  decryptBuffer,
  encryptText,
  decryptText,
};
