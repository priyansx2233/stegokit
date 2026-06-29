
'use strict';

const engine = require('../steganography/engine');

async function decodeImageController(req, res, next) {
  try {
    const file     = req.file;
    const password = req.body.password || null;

    if (!file) {
      return res.status(400).json({ success: false, error: 'encoded image file is required.' });
    }

    const recoveredBuf = await engine.decodeImage(file.buffer, { password });

    res.set({
      'Content-Type':        'image/png',
      'Content-Length':      recoveredBuf.length,
      'X-Decrypted':         password ? 'true' : 'false',
      'X-Size-Bytes':        String(recoveredBuf.length),
      'Content-Disposition': 'inline; filename="stegokit-recovered.png"',
    });
    res.end(recoveredBuf);
  } catch (err) {
    next(err);
  }
}

module.exports = decodeImageController;
