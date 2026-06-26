/**
 * @file encodeTextController.js
 * POST /api/encode/text
 * Fields: carrier (file), text (string), password? (string)
 * Response: binary PNG stream with metadata in headers
 */
'use strict';

const engine = require('../steganography/engine');

async function encodeTextController(req, res, next) {
  try {
    const file     = req.file;
    const text     = req.body.text;
    const password = req.body.password || null;

    if (!file) {
      return res.status(400).json({ success: false, error: 'carrier image file is required.' });
    }
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'text payload is required and must be non-empty.' });
    }

    const buf = await engine.encodeText(file.buffer, text, { password });

    // Stream binary PNG — no base64 wrapping, no JSON bloat
    res.set({
      'Content-Type':        'image/png',
      'Content-Length':      buf.length,
      'X-Encrypted':         password ? 'true' : 'false',
      'X-Text-Length':       String(text.length),
      'X-Size-Bytes':        String(buf.length),
      'Content-Disposition': 'attachment; filename="stegokit-text-encoded.png"',
    });
    res.end(buf);
  } catch (err) {
    next(err);
  }
}

module.exports = encodeTextController;
