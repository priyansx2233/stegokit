
'use strict';

const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const KEY_LEN   = 32;
const IV_LEN    = 16;
const SALT_LEN  = 16;

const SCRYPT_N  = 16384;
const SCRYPT_R  = 8;
const SCRYPT_P  = 1;

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

async function encryptBuffer(plaintext, password) {
  const salt = crypto.randomBytes(SALT_LEN);
  const iv   = crypto.randomBytes(IV_LEN);
  const key  = await deriveKey(password, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return Buffer.concat([salt, iv, encrypted]);
}

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

async function encryptText(text, password) {
  const buf = await encryptBuffer(Buffer.from(text, 'utf8'), password);
  return buf.toString('base64');
}

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
