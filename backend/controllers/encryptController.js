
'use strict';

const aes = require('../encryption/aes');

async function encryptController(req, res, next) {
  try {
    const { text, password } = req.body;
    if (!text || !password) {
      return res.status(400).json({ success: false, error: 'text and password are required.' });
    }
    const ciphertext = await aes.encryptText(text, password);
    res.json({ success: true, data: { ciphertext } });
  } catch (err) {
    next(err);
  }
}

async function decryptController(req, res, next) {
  try {
    const { ciphertext, password } = req.body;
    if (!ciphertext || !password) {
      return res.status(400).json({ success: false, error: 'ciphertext and password are required.' });
    }
    const text = await aes.decryptText(ciphertext, password);
    res.json({ success: true, data: { text } });
  } catch (err) {
    next(err);
  }
}

module.exports = { encryptController, decryptController };
