/**
 * @file errorHandler.js
 * @description Global Express error-handling middleware.
 *   Normalises all errors into a consistent JSON response shape:
 *     { success: false, error: string, code?: string }
 */

'use strict';

const multer = require('multer');

/**
 * Map known error types to HTTP status codes.
 * @param {Error} err
 * @returns {number}
 */
function resolveStatus(err) {
  // Multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return 413;
    return 400;
  }

  const msg = (err.message || '').toLowerCase();

  if (msg.includes('unsupported file type'))   return 415;
  if (msg.includes('carrier too small'))        return 422;
  if (msg.includes('text is too long'))         return 422;
  if (msg.includes('no valid steganographic')) return 422;
  if (msg.includes('decryption failed'))        return 401;
  if (msg.includes('incorrect password'))       return 401;
  if (msg.includes('failed to load image'))     return 400;
  if (msg.includes('not found'))                return 404;

  return 500;
}

/**
 * Express error handler — must be registered LAST (4-arg signature).
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  const status  = resolveStatus(err);
  const message = err.message || 'An unexpected error occurred.';

  // Log server errors
  if (status >= 500) {
    console.error('[StegoKit Error]', err);
  }

  res.status(status).json({
    success: false,
    error:   message,
    code:    err.code || undefined,
  });
}

module.exports = errorHandler;
