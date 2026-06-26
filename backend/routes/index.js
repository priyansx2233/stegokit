/**
 * @file routes/index.js
 * @description All StegoKit API routes.
 */
'use strict';

const express = require('express');
const router  = express.Router();
const upload  = require('../middleware/upload');

const encodeImageController  = require('../controllers/encodeImageController');
const decodeImageController  = require('../controllers/decodeImageController');
const encodeTextController   = require('../controllers/encodeTextController');
const decodeTextController   = require('../controllers/decodeTextController');
const visualizeController    = require('../controllers/visualizeController');
const { encryptController, decryptController } = require('../controllers/encryptController');

// ── Health check ─────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ success: true, service: 'StegoKit API', version: '1.0.0', uptime: process.uptime() });
});

// ── Image Steganography ───────────────────────────────────
/**
 * POST /api/encode/image
 * Multipart: carrier (image), secret (image), password? (text)
 */
router.post(
  '/encode/image',
  upload.fields([{ name: 'carrier', maxCount: 1 }, { name: 'secret', maxCount: 1 }]),
  encodeImageController
);

/**
 * POST /api/decode/image
 * Multipart: encoded (image), password? (text)
 */
router.post('/decode/image', upload.single('encoded'), decodeImageController);

// ── Text Steganography ────────────────────────────────────
/**
 * POST /api/encode/text
 * Multipart: carrier (image), text (string), password? (text)
 */
router.post('/encode/text', upload.single('carrier'), encodeTextController);

/**
 * POST /api/decode/text
 * Multipart: encoded (image), password? (text)
 */
router.post('/decode/text', upload.single('encoded'), decodeTextController);

// ── Visualization ─────────────────────────────────────────
/**
 * POST /api/visualize
 * Multipart: carrier (image), encoded (image), sampleCount? (number)
 */
router.post(
  '/visualize',
  upload.fields([{ name: 'carrier', maxCount: 1 }, { name: 'encoded', maxCount: 1 }]),
  visualizeController
);

// ── Standalone Encryption ─────────────────────────────────
/** POST /api/encrypt   Body JSON: { text, password } */
router.post('/encrypt', express.json(), encryptController);

/** POST /api/decrypt   Body JSON: { ciphertext, password } */
router.post('/decrypt', express.json(), decryptController);

module.exports = router;
