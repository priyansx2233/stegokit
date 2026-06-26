/**
 * @file binary.js
 * @description Utility helpers for binary/bit manipulation used throughout the
 *   steganography engine. All functions are pure and stateless.
 */

'use strict';

/**
 * Convert a positive integer to a zero-padded binary string of a given length.
 * @param {number} value - Non-negative integer.
 * @param {number} [bits=8] - Total number of bits in the output string.
 * @returns {string} Binary string, e.g. "01001000".
 */
function intToBinary(value, bits = 8) {
  if (value < 0) throw new RangeError('intToBinary: value must be >= 0');
  return value.toString(2).padStart(bits, '0');
}

/**
 * Convert a binary string to an unsigned integer.
 * @param {string} bin - Binary string (e.g. "01001000").
 * @returns {number} Unsigned integer.
 */
function binaryToInt(bin) {
  return parseInt(bin, 2);
}

/**
 * Convert a UTF-8 string to a binary bit-string (8 bits per character).
 * Uses TextEncoder for proper UTF-8 byte encoding.
 * @param {string} text - Input string.
 * @returns {string} Binary string of 8*byteLength bits.
 */
function textToBinary(text) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  return Array.from(bytes)
    .map((b) => intToBinary(b, 8))
    .join('');
}

/**
 * Convert a binary bit-string back to a UTF-8 string.
 * @param {string} bin - Binary string whose length must be divisible by 8.
 * @returns {string} Decoded UTF-8 string.
 */
function binaryToText(bin) {
  if (bin.length % 8 !== 0) {
    throw new RangeError('binaryToText: binary string length must be a multiple of 8');
  }
  const bytes = [];
  for (let i = 0; i < bin.length; i += 8) {
    bytes.push(binaryToInt(bin.slice(i, i + 8)));
  }
  const decoder = new TextDecoder('utf-8', { fatal: true });
  return decoder.decode(new Uint8Array(bytes));
}

/**
 * Convert a Buffer (or Uint8Array) to a binary bit-string.
 * @param {Buffer|Uint8Array} buf
 * @returns {string} Binary string.
 */
function bufferToBinary(buf) {
  return Array.from(buf)
    .map((b) => intToBinary(b, 8))
    .join('');
}

/**
 * Convert a binary bit-string to a Buffer.
 * @param {string} bin - Binary string (length must be divisible by 8).
 * @returns {Buffer}
 */
function binaryToBuffer(bin) {
  if (bin.length % 8 !== 0) {
    throw new RangeError('binaryToBuffer: binary string length must be a multiple of 8');
  }
  const bytes = [];
  for (let i = 0; i < bin.length; i += 8) {
    bytes.push(binaryToInt(bin.slice(i, i + 8)));
  }
  return Buffer.from(bytes);
}

/**
 * Get the Least Significant Bit of an integer.
 * @param {number} value
 * @returns {number} 0 or 1.
 */
function getLSB(value) {
  return value & 1;
}

/**
 * Set the Least Significant Bit of an integer to a given bit value.
 * @param {number} value - Original integer.
 * @param {number} bit - Bit to embed (0 or 1).
 * @returns {number} Modified integer.
 */
function setLSB(value, bit) {
  return (value & ~1) | (bit & 1);
}

/**
 * Encode a 32-bit unsigned integer as a 32-character binary string.
 * Used to embed payload-length headers.
 * @param {number} n
 * @returns {string} 32-char binary string.
 */
function encodeLength(n) {
  return intToBinary(n >>> 0, 32);
}

/**
 * Decode a 32-character binary string to a 32-bit unsigned integer.
 * @param {string} bin - Must be exactly 32 chars.
 * @returns {number}
 */
function decodeLength(bin) {
  return binaryToInt(bin.slice(0, 32)) >>> 0;
}

module.exports = {
  intToBinary,
  binaryToInt,
  textToBinary,
  binaryToText,
  bufferToBinary,
  binaryToBuffer,
  getLSB,
  setLSB,
  encodeLength,
  decodeLength,
};
