
'use strict';

const multer = require('multer');

function resolveStatus(err) {

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
  if (msg.includes('cors origin not allowed'))  return 403;
  if (msg.includes('failed to load image'))     return 400;
  if (msg.includes('not found'))                return 404;

  return 500;
}

function errorHandler(err, _req, res, _next) {
  const status  = resolveStatus(err);
  const message = err.message || 'An unexpected error occurred.';

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
