/**
 * @file server.js
 * @description StegoKit Express server entry point.
 */
'use strict';

const express      = require('express');
const cors         = require('cors');
const routes       = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'https://codeaurelius0.github.io',
  'https://codeaurelius0.github.io/stegokit',
].filter(Boolean);

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('CORS origin not allowed'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

// ── Routes ────────────────────────────────────────────────
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// ── Global Error Handler ──────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🔐 StegoKit API running at http://localhost:${PORT}/api`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app; // exported for testing
