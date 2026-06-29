
'use strict';

const engine = require('../steganography/engine');

async function decodeTextController(req, res, next) {
  try {
    const file     = req.file;
    const password = req.body.password || null;

    if (!file) {
      return res.status(400).json({ success: false, error: 'encoded image file is required.' });
    }

    const text = await engine.decodeText(file.buffer, { password });

    res.json({
      success: true,
      data: {
        text,
        textLength: text.length,
        decrypted:  !!password,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = decodeTextController;
