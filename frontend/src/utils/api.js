/**
 * @file utils/api.js
 * @description Axios client with base URL and helper methods for all API calls.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 600000, // 10 min — large image encoding/decoding can take time
});

// When responseType is 'arraybuffer' and the server returns an error JSON,
// axios gives us an ArrayBuffer — decode it back so error.response.data.error works.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.config?.responseType === 'arraybuffer' && err.response?.data instanceof ArrayBuffer) {
      try {
        const text = new TextDecoder().decode(err.response.data);
        err.response.data = JSON.parse(text);
      } catch (_) { /* leave as-is */ }
    }
    return Promise.reject(err);
  }
);

// ── Generic helpers ───────────────────────────────────────────────────────────

/**
 * Build a FormData object from a plain object.
 * Values that are File objects are appended as-is; others are stringified.
 */
function buildForm(fields) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue;
    form.append(key, value);
  }
  return form;
}

// ── API methods ───────────────────────────────────────────────────────────────

export const stegoApi = {
  /** Check backend health */
  health: () => api.get('/health'),

  /** POST /encode/image — hide secret image in carrier; returns binary PNG blob URL */
  encodeImage: async ({ carrier, secret, password }) => {
    const res = await api.post(
      '/encode/image',
      buildForm({ carrier, secret, password }),
      { responseType: 'arraybuffer' }
    );
    const blob    = new Blob([res.data], { type: 'image/png' });
    const url     = URL.createObjectURL(blob);
    const headers = res.headers;
    return {
      data: {
        data: {
          imageDataUrl: url,
          mimeType:     'image/png',
          encrypted:    headers['x-encrypted'] === 'true',
          sizeBytes:    parseInt(headers['x-size-bytes'] || '0', 10),
          capacity:     {},   // capacity info dropped (no JSON wrapper)
        },
      },
    };
  },

  /** POST /decode/image — extract hidden image; returns binary PNG blob URL */
  decodeImage: async ({ encoded, password }) => {
    const res = await api.post(
      '/decode/image',
      buildForm({ encoded, password }),
      { responseType: 'arraybuffer' }
    );
    const blob    = new Blob([res.data], { type: 'image/png' });
    const url     = URL.createObjectURL(blob);
    const headers = res.headers;
    return {
      data: {
        data: {
          imageDataUrl: url,
          mimeType:     'image/png',
          decrypted:    headers['x-decrypted'] === 'true',
          sizeBytes:    parseInt(headers['x-size-bytes'] || '0', 10),
        },
      },
    };
  },

  /** POST /encode/text — hide text in carrier; returns binary PNG blob URL */
  encodeText: async ({ carrier, text, password }) => {
    const res = await api.post(
      '/encode/text',
      buildForm({ carrier, text, password }),
      { responseType: 'arraybuffer' }
    );
    const blob    = new Blob([res.data], { type: 'image/png' });
    const url     = URL.createObjectURL(blob);
    const headers = res.headers;
    return {
      data: {
        data: {
          imageDataUrl: url,
          mimeType:     'image/png',
          encrypted:    headers['x-encrypted'] === 'true',
          textLength:   parseInt(headers['x-text-length'] || '0', 10),
          sizeBytes:    parseInt(headers['x-size-bytes']  || '0', 10),
          capacity:     null,
        },
      },
    };
  },

  /** POST /decode/text — extract hidden text */
  decodeText: ({ encoded, password }) =>
    api.post('/decode/text', buildForm({ encoded, password })),

  /** POST /visualize — pixel-level comparison report */
  visualize: ({ carrier, encoded, sampleCount = 16 }) =>
    api.post('/visualize', buildForm({ carrier, encoded, sampleCount: String(sampleCount) })),

  /** POST /encrypt — standalone AES-256 encrypt */
  encrypt: ({ text, password }) =>
    api.post('/encrypt', { text, password }),

  /** POST /decrypt — standalone AES-256 decrypt */
  decrypt: ({ ciphertext, password }) =>
    api.post('/decrypt', { ciphertext, password }),
};

export default api;
