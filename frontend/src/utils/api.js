
import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 600000,
});

api.interceptors.request.use((config) => {
  if (
    apiBaseUrl === '/api' &&
    typeof window !== 'undefined' &&
    window.location.hostname.endsWith('github.io')
  ) {
    throw new Error('API URL is not configured for GitHub Pages. Set VITE_API_URL to your deployed backend URL.');
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.config?.responseType === 'arraybuffer' && err.response?.data instanceof ArrayBuffer) {
      try {
        const text = new TextDecoder().decode(err.response.data);
        err.response.data = JSON.parse(text);
      } catch (_) {  }
    }
    return Promise.reject(err);
  }
);

function buildForm(fields) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined) continue;
    form.append(key, value);
  }
  return form;
}

export const stegoApi = {

  health: () => api.get('/health'),

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
          capacity:     {},
        },
      },
    };
  },

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

  decodeText: ({ encoded, password }) =>
    api.post('/decode/text', buildForm({ encoded, password })),

  visualize: ({ carrier, encoded, sampleCount = 16 }) =>
    api.post('/visualize', buildForm({ carrier, encoded, sampleCount: String(sampleCount) })),

  encrypt: ({ text, password }) =>
    api.post('/encrypt', { text, password }),

  decrypt: ({ ciphertext, password }) =>
    api.post('/decrypt', { ciphertext, password }),
};

export default api;
