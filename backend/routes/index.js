
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

router.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to StegoKit API',
    status: 'Running',
    healthCheck: '/api/health'
  });
});

router.get('/health', (_req, res) => {
  res.json({ success: true, service: 'StegoKit API', version: '1.0.0', uptime: process.uptime() });
});

router.post(
  '/encode/image',
  upload.fields([{ name: 'carrier', maxCount: 1 }, { name: 'secret', maxCount: 1 }]),
  encodeImageController
);

router.post('/decode/image', upload.single('encoded'), decodeImageController);

router.post('/encode/text', upload.single('carrier'), encodeTextController);

router.post('/decode/text', upload.single('encoded'), decodeTextController);

router.post(
  '/visualize',
  upload.fields([{ name: 'carrier', maxCount: 1 }, { name: 'encoded', maxCount: 1 }]),
  visualizeController
);

router.post('/encrypt', express.json(), encryptController);

router.post('/decrypt', express.json(), decryptController);

module.exports = router;
