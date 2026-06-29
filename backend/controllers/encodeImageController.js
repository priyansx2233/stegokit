
'use strict';

const engine = require('../steganography/engine');

async function encodeImageController(req, res, next) {
  try {
    const files    = req.files;
    const password = req.body.password || null;

    if (!files || !files.carrier || !files.carrier[0]) {
      return res.status(400).json({ success: false, error: 'carrier image is required.' });
    }
    if (!files.secret || !files.secret[0]) {
      return res.status(400).json({ success: false, error: 'secret image is required.' });
    }

    const carrierBuf = files.carrier[0].buffer;
    const secretBuf  = files.secret[0].buffer;

    const encodedBuf = await engine.encodeImage(carrierBuf, secretBuf, { password });

    res.set({
      'Content-Type':        'image/png',
      'Content-Length':      encodedBuf.length,
      'X-Encrypted':         password ? 'true' : 'false',
      'X-Size-Bytes':        String(encodedBuf.length),
      'Content-Disposition': 'attachment; filename="stegokit-encoded.png"',
    });
    res.end(encodedBuf);
  } catch (err) {
    next(err);
  }
}

module.exports = encodeImageController;
