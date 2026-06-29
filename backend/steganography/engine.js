
'use strict';

const Jimp   = require('jimp');
const sharp  = require('sharp');
const zlib   = require('zlib');
const binary = require('../utils/binary');
const aes    = require('../encryption/aes');

const HEADER_BITS    = 32;
const BITS_PER_PIXEL = 3;
const EOF_MARKER     = '\x00';
const MAGIC_HEADER   = 'STEGO';

async function loadImage(source) {
  try {
    const { data, info } = await sharp(source)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    return new Jimp({
      data:   Buffer.from(data),
      width:  info.width,
      height: info.height,
    });
  } catch (err) {
    throw new Error(`Failed to load image: ${err.message}`);
  }
}

function capacityInfo(width, height) {
  const totalPixels  = width * height;
  const headerPixels = HEADER_BITS;
  const dataPixels   = totalPixels - headerPixels;
  const maxBits      = dataPixels * BITS_PER_PIXEL;
  const maxBytes     = Math.floor(maxBits / 8);
  return { totalPixels, headerPixels, dataPixels, maxBits, maxBytes };
}

function embedBytes(img, payload, startPixel) {
  const px    = img.bitmap.data;
  const total = payload.length * 8;

  for (let bitIdx = 0; bitIdx < total; bitIdx++) {
    const bytePos   = Math.floor(bitIdx / 8);
    const bitInByte = 7 - (bitIdx % 8);
    const bit       = (payload[bytePos] >> bitInByte) & 1;

    const pIdx   = startPixel + Math.floor(bitIdx / 3);
    const ch     = bitIdx % 3;
    const offset = pIdx * 4 + ch;
    px[offset]   = (px[offset] & 0xFE) | bit;
  }
}

function extractBytes(img, numBytes, startPixel) {
  const px   = img.bitmap.data;
  const out  = Buffer.allocUnsafe(numBytes);
  const bits = numBytes * 8;

  for (let bitIdx = 0; bitIdx < bits; bitIdx++) {
    const pIdx     = startPixel + Math.floor(bitIdx / 3);
    const ch       = bitIdx % 3;
    const offset   = pIdx * 4 + ch;
    const bit      = px[offset] & 1;

    const bytePos   = Math.floor(bitIdx / 8);
    const bitInByte = 7 - (bitIdx % 8);
    if (bitInByte === 7) out[bytePos] = 0;
    out[bytePos] |= (bit << bitInByte);
  }
  return out;
}

function writeHeader(img, length) {
  const px = img.bitmap.data;
  for (let i = 0; i < HEADER_BITS; i++) {
    const bit     = (length >>> (31 - i)) & 1;
    const offset  = i * 4;
    px[offset]    = (px[offset] & 0xFE) | bit;
  }
}

function readHeader(img) {
  const px = img.bitmap.data;
  let   n  = 0;
  for (let i = 0; i < HEADER_BITS; i++) {
    n = (n << 1) | (px[i * 4] & 1);
  }
  return n >>> 0;
}

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

async function encodeImage(carrierSource, secretSource, opts = {}) {
  const { password, onProgress } = opts;

  const carrier = await loadImage(carrierSource);
  const secret  = await loadImage(secretSource);

  const dimBuf = Buffer.alloc(8);
  dimBuf.writeUInt32BE(secret.bitmap.width,  0);
  dimBuf.writeUInt32BE(secret.bitmap.height, 4);
  let rawPayload = Buffer.concat([dimBuf, Buffer.from(secret.bitmap.data)]);

  let payload = zlib.deflateSync(rawPayload, { level: zlib.constants.Z_BEST_COMPRESSION });

  payload = Buffer.concat([Buffer.from([0x01]), payload]);

  if (password) {
    payload = await aes.encryptBuffer(Buffer.from(payload), password);
  }

  const needed = payload.length;
  let cap = capacityInfo(carrier.bitmap.width, carrier.bitmap.height);

  if (needed > cap.maxBytes) {

    const currentPixels = carrier.bitmap.width * carrier.bitmap.height;
    const requiredPixels = Math.ceil((needed * 8) / BITS_PER_PIXEL) + HEADER_BITS;
    const scaleFactor = Math.ceil(Math.sqrt(requiredPixels / currentPixels)) + 1;

    const newW = carrier.bitmap.width  * scaleFactor;
    const newH = carrier.bitmap.height * scaleFactor;
    carrier.resize(newW, newH, Jimp.RESIZE_NEAREST_NEIGHBOR);
    cap = capacityInfo(newW, newH);
  }

  writeHeader(carrier, payload.length);

  embedBytes(carrier, payload, HEADER_BITS);

  if (onProgress) onProgress(100);

  const { width, height } = carrier.bitmap;
  return sharp(Buffer.from(carrier.bitmap.data), {
    raw: { width, height, channels: 4 },
  }).png({ compressionLevel: 6 }).toBuffer();
}

async function decodeImage(encodedSource, opts = {}) {
  const { password } = opts;

  const img = await loadImage(encodedSource);
  const payloadBytes = readHeader(img);

  if (payloadBytes === 0 || payloadBytes > capacityInfo(img.bitmap.width, img.bitmap.height).maxBytes) {
    throw new Error('No valid steganographic payload found in this image.');
  }

  const payload_raw = extractBytes(img, payloadBytes, HEADER_BITS);
  let   payload     = payload_raw;

  if (password) {
    payload = await aes.decryptBuffer(payload, password);
  }

  const compressionFlag = payload[0];
  payload = payload.slice(1);
  if (compressionFlag === 0x01) {
    payload = zlib.inflateSync(payload);
  }

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
  embedBytes(carrier, payload, HEADER_BITS);

  if (onProgress) onProgress(100);

  const { width, height } = carrier.bitmap;
  return sharp(Buffer.from(carrier.bitmap.data), {
    raw: { width, height, channels: 4 },
  }).png({ compressionLevel: 6 }).toBuffer();
}

async function decodeText(encodedSource, opts = {}) {
  const { password } = opts;

  const img = await loadImage(encodedSource);
  const payloadBytes = readHeader(img);

  if (payloadBytes === 0 || payloadBytes > capacityInfo(img.bitmap.width, img.bitmap.height).maxBytes) {
    throw new Error('No valid steganographic payload found in this image.');
  }

  let payload = extractBytes(img, payloadBytes, HEADER_BITS);

  if (password) {
    payload = await aes.decryptBuffer(payload, password);
  }

  const text = payload.toString('utf8');

  const eofIdx = text.indexOf(EOF_MARKER);
  return eofIdx !== -1 ? text.slice(0, eofIdx) : text;
}

async function visualize(carrierSource, encodedSource, opts = {}) {
  const { sampleCount = 16 } = opts;

  const original = await loadImage(carrierSource);
  const encoded  = await loadImage(encodedSource);

  const { width, height }    = original.bitmap;
  const payloadBytes         = readHeader(encoded);
  const cap                  = capacityInfo(width, height);
  const percentUsed          = ((payloadBytes / cap.maxBytes) * 100).toFixed(2);

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
