/**
 * @file visualizeController.js
 * POST /api/visualize
 * Fields: carrier (file), encoded (file), sampleCount? (number)
 */
'use strict';

const engine = require('../steganography/engine');

async function visualizeController(req, res, next) {
  try {
    const files       = req.files;
    const sampleCount = parseInt(req.body.sampleCount, 10) || 16;

    if (!files || !files.carrier || !files.carrier[0]) {
      return res.status(400).json({ success: false, error: 'original carrier image is required.' });
    }
    if (!files.encoded || !files.encoded[0]) {
      return res.status(400).json({ success: false, error: 'encoded image is required.' });
    }

    const report = await engine.visualize(
      files.carrier[0].buffer,
      files.encoded[0].buffer,
      { sampleCount: Math.min(Math.max(sampleCount, 4), 64) }
    );

    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
}

module.exports = visualizeController;
