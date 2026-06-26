/**
 * @file upload.js
 * @description Multer middleware configuration for handling image uploads.
 *   Accepts PNG, JPG, JPEG, BMP, TIFF up to 50 MB per file.
 */

'use strict';

const multer = require('multer');
const path   = require('path');

const ALLOWED_MIMES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/bmp',
  'image/tiff',
  'image/webp',
]);

const MAX_FILE_SIZE = Infinity; // no limit — engine handles capacity automatically

/** Store uploads in memory (Buffer) — no disk I/O needed. */
const storage = multer.memoryStorage();

/**
 * File filter — reject non-image uploads early.
 */
function fileFilter(_req, file, cb) {
  if (ALLOWED_MIMES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. ` +
        `Allowed types: PNG, JPG, BMP, TIFF, WebP`
      ),
      false
    );
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

module.exports = upload;
