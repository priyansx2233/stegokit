
'use strict';

const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const routes       = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  ...String(process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'https://codeaurelius0.github.io',
  'https://codeaurelius0.github.io/stegokit',

  'https://stegokit.vercel.app',
].filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  if (/^https:\/\/stegokit[a-z0-9-]*\.vercel\.app$/.test(origin)) return true;
  return false;
}
const frontendDist = path.resolve(__dirname, '../frontend/dist');

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS origin not allowed: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

app.options('*', cors());

app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));

app.use('/api', routes);

app.get('/', (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    res.json({ message: 'StegoKit Backend is running. Please use the frontend app on port 5174 or access API at /api' });
  }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
      if (err) next(err);
    });
  });
}

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\nStegoKit API running at http://localhost:${PORT}/api`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app;
