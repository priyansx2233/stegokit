
'use strict';

function intToBinary(value, bits = 8) {
  if (value < 0) throw new RangeError('intToBinary: value must be >= 0');
  return value.toString(2).padStart(bits, '0');
}

function binaryToInt(bin) {
  return parseInt(bin, 2);
}

function textToBinary(text) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  return Array.from(bytes)
    .map((b) => intToBinary(b, 8))
    .join('');
}

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

function bufferToBinary(buf) {
  return Array.from(buf)
    .map((b) => intToBinary(b, 8))
    .join('');
}

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

function getLSB(value) {
  return value & 1;
}

function setLSB(value, bit) {
  return (value & ~1) | (bit & 1);
}

function encodeLength(n) {
  return intToBinary(n >>> 0, 32);
}

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
