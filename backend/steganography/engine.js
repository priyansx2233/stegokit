/**
 * @file engine.js
 * @description Core Steganography Engine — framework-agnostic, pure Node.js.
 *   Exposes: encodeImage, decodeImage, encodeText, decodeText,
 *            visualize, calculateCapacity, encryptPayload, decryptPayload.
 *
 * LSB Algorithm:
 *   • Payload length (32 bits) is stored in the first 32 pixels (R-channel LSB)
 *   • Data bits are spread across R, G, B channel LSBs (3 bits / pixel)
 *   • Alpha channel is left untouched to avoid transparency artefacts
 *   • A null-byte terminator (8 zero-bits) is appended after text payloads
 *
 * No-limit strategy:
 *   • Payloads are zlib-compressed before embedding (typically 60-80% reduction)
 *   • If the carrier is still too small, it is automatically upscaled to fit
 */

'use strict';

const Jimp   = require('jimp');
const sharp  = require('sharp');
const zlib   = require('zlib');
const binary = require('../utils/binary');
const aes    = require('../encryption/aes');

// ─── Constants ────────────────────────────────────────────────────────────────
const HEADER_BITS    = 32;          // 32-bit unsigned payload-length header
const BITS_PER_PIXEL = 3;           // R, G, B LSBs used; Alpha left intact
const EOF_MARKER     = '\x00';      // Null byte marks end-of-text payload
const MAGIC_HEADER   = 'STEGO';     // 5-byte ASCII magic string in image header

/**
 * Load an image from a Buffer or file path using sharp → Jimp.
 * sharp handles ALL formats (PNG, JPEG, BMP, TIFF, WebP) robustly,
 * including malformed files with trailing bytes, bad chunks, etc.
 * It outputs raw RGBA pixel data which we construct into a Jimp object
 * so that all downstream LSB pixel operations are unchanged.
 *
 * @param {Buffer|string} source
 * @returns {Promise<Jimp>}
 */
async function loadImage(source) {
  try {
    const { data, info } = await sharp(source)
      .ensureAlpha()          // guarantee 4-channel RGBA output
      .raw()                  // raw pixel buffer — no re-encoding
      .toBuffer({ resolveWithObject: true });

    // Build a Jimp instance directly from raw RGBA data
    return new Jimp({
      data:   Buffer.from(data),
      width:  info.width,
      height: info.height,
    });
  } catch (err) {
    throw new Error(`Failed to load image: ${err.message}`);
  }
}

/**
 * Calculate the maximum number of DATA bytes that can be hidden in an image.
 * We reserve the first HEADER_BITS pixels (R-ch only) for the length header.
 * Remaining pixels provide BITS_PER_PIXEL bits each.
 *
 * @param {number} width
 * @param {number} height
 * @returns {{ totalPixels: number, headerPixels: number, dataPixels: number,
 *             maxBytes: number, maxBits: number }}
 */
function capacityInfo(width, height) {
  const totalPixels  = width * height;
  const headerPixels = HEADER_BITS;           // one bit per pixel in R channel
  const dataPixels   = totalPixels - headerPixels;
  const maxBits      = dataPixels * BITS_PER_PIXEL;
  const maxBytes     = Math.floor(maxBits / 8);
  return { totalPixels, headerPixels, dataPixels, maxBits, maxBytes };
}

/**
 * Embed raw payload bytes into a Jimp image's pixel buffer using LSB.
 * Works directly on bytes — NO intermediate bit-string (saves ~87% memory).
 * Stores 3 bits per pixel across R, G, B channels.
 *
 * @param {Jimp}   img         - Carrier image (modified in-place).
 * @param {Buffer} payload     - Bytes to embed.
 * @param {number} startPixel  - Pixel index to begin at.
 */
function embedBytes(img, payload, startPixel) {
  const px    = img.bitmap.data;  // raw RGBA Buffer — direct access, zero copy
  const total = payload.length * 8;  // total bits to write

  for (let bitIdx = 0; bitIdx < total; bitIdx++) {
    const bytePos   = Math.floor(bitIdx / 8);
    const bitInByte = 7 - (bitIdx % 8);        // MSB first
    const bit       = (payload[bytePos] >> bitInByte) & 1;

    const pIdx   = startPixel + Math.floor(bitIdx / 3);
    const ch     = bitIdx % 3;                  // 0=R, 1=G, 2=B
    const offset = pIdx * 4 + ch;               // RGBA flat offset
    px[offset]   = (px[offset] & 0xFE) | bit;  // set LSB
  }
}

/**
 * Extract raw payload bytes from a Jimp image's pixel buffer using LSB.
 * Works directly on bytes — NO intermediate bit-string.
 *
 * @param {Jimp}   img        - Source image.
 * @param {number} numBytes   - Number of payload bytes to extract.
 * @param {number} startPixel - Pixel index to begin at.
 * @returns {Buffer}
 */
function extractBytes(img, numBytes, startPixel) {
  const px   = img.bitmap.data;
  const out  = Buffer.allocUnsafe(numBytes);
  const bits = numBytes * 8;

  for (let bitIdx = 0; bitIdx < bits; bitIdx++) {
    const pIdx     = startPixel + Math.floor(bitIdx / 3);
    const ch       = bitIdx % 3;           // 0=R,1=G,2=B
    const offset   = pIdx * 4 + ch;
    const bit      = px[offset] & 1;

    const bytePos   = Math.floor(bitIdx / 8);
    const bitInByte = 7 - (bitIdx % 8);    // MSB first
    if (bitInByte === 7) out[bytePos] = 0; // clear before writing
    out[bytePos] |= (bit << bitInByte);
  }
  return out;
}

/**
 * Store a 32-bit length value in the first HEADER_BITS pixels
 * using only the R channel LSB of each pixel — directly in the pixel buffer.
 *
 * @param {Jimp}   img
 * @param {number} length
 */
function writeHeader(img, length) {
  const px = img.bitmap.data;
  for (let i = 0; i < HEADER_BITS; i++) {
    const bit     = (length >>> (31 - i)) & 1;  // MSB first
    const offset  = i * 4;                       // R channel of pixel i
    px[offset]    = (px[offset] & 0xFE) | bit;
  }
}

/**
 * Read the 32-bit length from the first HEADER_BITS pixels (R channel LSBs).
 * @param {Jimp} img
 * @returns {number}
 */
function readHeader(img) {
  const px = img.bitmap.data;
  let   n  = 0;
  for (let i = 0; i < HEADER_BITS; i++) {
    n = (n << 1) | (px[i * 4] & 1);  // R channel of pixel i
  }
  return n >>> 0;  // unsigned
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calculate capacity info for an image buffer or path.
 * @param {Buffer|string} carrierSource
 * @returns {Promise<{ width, height, totalPixels, maxBytes, usedBytes, remainingBytes, percentUsed }>}
 */
async function calculateCapacity(carrierSource, payloadBytes = 0) {
  const img = await loadImage(carrierSource);
  const { width, height } = img.bitmap;
  const cap = capacityInfo(width, height);

  return {
    width,
    height,
    totalPixels: cap.totalPixels,
    maxBytes:    cap.maxBytes,
    usedBytes:   payloadBytes,
    remainingBytes: Math.max(0, cap.maxBytes - payloadBytes),
    percentUsed: payloadBytes > 0
      ? ((payloadBytes / cap.maxBytes) * 100).toFixed(2)
      : '0.00',
  };
}

/**
 * Hide a secret image inside a carrier image using LSB steganography.
 *
 * @param {Buffer|string} carrierSource - Carrier (cover) image.
 * @param {Buffer|string} secretSource  - Secret image to hide.
 * @param {{ password?: string, onProgress?: Function }} [opts]
 * @returns {Promise<Buffer>} PNG buffer of the encoded image.
 */
async function encodeImage(carrierSource, secretSource, opts = {}) {
  const { password, onProgress } = opts;

  const carrier = await loadImage(carrierSource);
  const secret  = await loadImage(secretSource);

  // Flatten secret to raw RGBA bytes and prepend dimensions
  const dimBuf = Buffer.alloc(8);
  dimBuf.writeUInt32BE(secret.bitmap.width,  0);
  dimBuf.writeUInt32BE(secret.bitmap.height, 4);
  let rawPayload = Buffer.concat([dimBuf, Buffer.from(secret.bitmap.data)]);

  // ── Step 1: zlib-compress the payload (often 60-80% smaller) ──────────────
  let payload = zlib.deflateSync(rawPayload, { level: zlib.constants.Z_BEST_COMPRESSION });
  // Prepend a 1-byte flag: 0x01 = compressed, 0x00 = raw (future-proof)
  payload = Buffer.concat([Buffer.from([0x01]), payload]);

  // ── Step 2: Optional AES-256 encryption ───────────────────────────────────
  if (password) {
    payload = await aes.encryptBuffer(Buffer.from(payload), password);
  }

  // ── Step 3: Auto-upscale carrier if needed ────────────────────────────────
  const needed = payload.length;
  let cap = capacityInfo(carrier.bitmap.width, carrier.bitmap.height);

  if (needed > cap.maxBytes) {
    // Calculate the scale factor required (by pixel count)
    const currentPixels = carrier.bitmap.width * carrier.bitmap.height;
    const requiredPixels = Math.ceil((needed * 8) / BITS_PER_PIXEL) + HEADER_BITS;
    const scaleFactor = Math.ceil(Math.sqrt(requiredPixels / currentPixels)) + 1;

    const newW = carrier.bitmap.width  * scaleFactor;
    const newH = carrier.bitmap.height * scaleFactor;
    carrier.resize(newW, newH, Jimp.RESIZE_NEAREST_NEIGHBOR);
    cap = capacityInfo(newW, newH);
  }

  // Write 32-bit header (payload byte count)
  writeHeader(carrier, payload.length);

  // Embed payload bytes directly into pixel buffer
  embedBytes(carrier, payload, HEADER_BITS);

  if (onProgress) onProgress(100);

  // Use sharp to encode PNG — much lower memory than Jimp.getBufferAsync
  const { width, height } = carrier.bitmap;
  return sharp(Buffer.from(carrier.bitmap.data), {
    raw: { width, height, channels: 4 },
  }).png({ compressionLevel: 6 }).toBuffer();
}

/**
 * Extract a hidden image from an encoded carrier image.
 *
 * @param {Buffer|string} encodedSource
 * @param {{ password?: string }} [opts]
 * @returns {Promise<Buffer>} PNG buffer of the recovered secret image.
 */
async function decodeImage(encodedSource, opts = {}) {
  const { password } = opts;

  const img = await loadImage(encodedSource);
  const payloadBytes = readHeader(img);

  if (payloadBytes === 0 || payloadBytes > capacityInfo(img.bitmap.width, img.bitmap.height).maxBytes) {
    throw new Error('No valid steganographic payload found in this image.');
  }

  // Extract payload bytes directly from pixel buffer
  const payload_raw = extractBytes(img, payloadBytes, HEADER_BITS);
  let   payload     = payload_raw;

  // ── Step 1: Optional AES-256 decryption ───────────────────────────────────
  if (password) {
    payload = await aes.decryptBuffer(payload, password);
  }

  // ── Step 2: Decompress if compression flag is set ─────────────────────────
  const compressionFlag = payload[0];
  payload = payload.slice(1); // strip the flag byte
  if (compressionFlag === 0x01) {
    payload = zlib.inflateSync(payload);
  }

  // ── Step 3: Reconstruct image using sharp — no Jimp wrapper needed ─────────
  if (payload.length < 8) throw new Error('Extracted payload is too small – data may be corrupted.');
  const width  = payload.readUInt32BE(0);
  const height = payload.readUInt32BE(4);
  const rgba   = payload.slice(8);

  if (rgba.length !== width * height * 4) {
    throw new Error('Extracted image dimensions do not match payload size – data corrupted or wrong password.');
  }

  return sharp(Buffer.from(rgba), {
    raw: { width, height, channels: 4 },
  }).png({ compressionLevel: 6 }).toBuffer();
}

/**
 * Hide text inside a carrier image using LSB steganography.
 *
 * @param {Buffer|string} carrierSource
 * @param {string} text - UTF-8 / Unicode text to hide.
 * @param {{ password?: string, onProgress?: Function }} [opts]
 * @returns {Promise<Buffer>} PNG buffer of the encoded image.
 */
async function encodeText(carrierSource, text, opts = {}) {
  const { password, onProgress } = opts;

  if (typeof text !== 'string' || text.length === 0) {
    throw new Error('Text payload must be a non-empty string.');
  }

  const carrier = await loadImage(carrierSource);

  let payload = Buffer.from(text + EOF_MARKER, 'utf8');

  if (password) {
    payload = await aes.encryptBuffer(payload, password);
  }

  const { maxBytes } = capacityInfo(carrier.bitmap.width, carrier.bitmap.height);
  if (payload.length > maxBytes) {
    throw new Error(
      `Text is too long: needs ${payload.length} bytes, carrier capacity is ${maxBytes} bytes.`
    );
  }

  writeHeader(carrier, payload.length);
  embedBytes(carrier, payload, HEADER_BITS);   // memory-efficient, no bit-string

  if (onProgress) onProgress(100);

  // Use sharp for PNG output — much lower memory than Jimp.getBufferAsync
  const { width, height } = carrier.bitmap;
  return sharp(Buffer.from(carrier.bitmap.data), {
    raw: { width, height, channels: 4 },
  }).png({ compressionLevel: 6 }).toBuffer();
}

/**
 * Extract hidden text from an encoded carrier image.
 *
 * @param {Buffer|string} encodedSource
 * @param {{ password?: string }} [opts]
 * @returns {Promise<string>} The recovered text.
 */
async function decodeText(encodedSource, opts = {}) {
  const { password } = opts;

  const img = await loadImage(encodedSource);
  const payloadBytes = readHeader(img);

  if (payloadBytes === 0 || payloadBytes > capacityInfo(img.bitmap.width, img.bitmap.height).maxBytes) {
    throw new Error('No valid steganographic payload found in this image.');
  }

  let payload = extractBytes(img, payloadBytes, HEADER_BITS);  // memory-efficient

  if (password) {
    payload = await aes.decryptBuffer(payload, password);
  }

  const text = payload.toString('utf8');

  // Strip EOF marker
  const eofIdx = text.indexOf(EOF_MARKER);
  return eofIdx !== -1 ? text.slice(0, eofIdx) : text;
}

/**
 * Generate a visualization report comparing original vs encoded pixel data.
 *
 * Returns a JSON-serialisable object suitable for the frontend visualizer.
 *
 * @param {Buffer|string} carrierSource  - Original (pre-encode) carrier.
 * @param {Buffer|string} encodedSource  - Encoded image.
 * @param {{ sampleCount?: number }} [opts]
 * @returns {Promise<Object>} Visualization report.
 */
async function visualize(carrierSource, encodedSource, opts = {}) {
  const { sampleCount = 16 } = opts;

  const original = await loadImage(carrierSource);
  const encoded  = await loadImage(encodedSource);

  const { width, height }    = original.bitmap;
  const payloadBytes         = readHeader(encoded);
  const cap                  = capacityInfo(width, height);
  const percentUsed          = ((payloadBytes / cap.maxBytes) * 100).toFixed(2);

  // Sample pixels at even spacing across the image
  const step    = Math.max(1, Math.floor(cap.totalPixels / sampleCount));
  const samples = [];

  for (let i = 0; i < sampleCount; i++) {
    const pixIdx = i * step + HEADER_BITS;
    if (pixIdx >= cap.totalPixels) break;
    const x = pixIdx % width;
    const y = Math.floor(pixIdx / width);

    const origRGBA = Jimp.intToRGBA(original.getPixelColor(x, y));
    const encRGBA  = Jimp.intToRGBA(encoded.getPixelColor(x, y));

    const origBin = {
      r: binary.intToBinary(origRGBA.r),
      g: binary.intToBinary(origRGBA.g),
      b: binary.intToBinary(origRGBA.b),
    };
    const encBin = {
      r: binary.intToBinary(encRGBA.r),
      g: binary.intToBinary(encRGBA.g),
      b: binary.intToBinary(encRGBA.b),
    };

    const changedBits = ['r', 'g', 'b'].filter(
      (ch) => origBin[ch][7] !== encBin[ch][7]
    );

    samples.push({
      pixelIndex: pixIdx,
      x, y,
      original: { ...origRGBA, binary: origBin },
      encoded:  { ...encRGBA,  binary: encBin  },
      changedBits,
      lsbsChanged: changedBits.length,
    });
  }

  // Extract 32-bit header bits for display
  const headerBits = [];
  for (let i = 0; i < HEADER_BITS; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    const { r } = Jimp.intToRGBA(encoded.getPixelColor(x, y));
    headerBits.push(binary.getLSB(r).toString());
  }

  return {
    imageInfo:    { width, height, totalPixels: cap.totalPixels },
    capacity:     { maxBytes: cap.maxBytes, usedBytes: payloadBytes, percentUsed },
    headerBits:   headerBits.join(''),
    payloadBytes,
    samples,
    algorithm:    'LSB – R/G/B channels (3 bits/pixel)',
    headerFormat: '32-bit unsigned integer in R-channel LSBs of first 32 pixels',
  };
}

/**
 * Convenience re-exports of encryption functions for controller use.
 */
const encryptPayload = aes.encryptBuffer;
const decryptPayload = aes.decryptBuffer;

module.exports = {
  encodeImage,
  decodeImage,
  encodeText,
  decodeText,
  visualize,
  calculateCapacity,
  encryptPayload,
  decryptPayload,
};
