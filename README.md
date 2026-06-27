# StegoKit 🔐

> **Production-grade Steganography Toolkit** — Hide images and text inside carrier images using LSB encoding, with optional AES-256 encryption.

![StegoKit Architecture](../steganography-architecture.html)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🖼️ **Image → Image** | Hide any PNG inside a carrier using LSB pixel encoding across RGB channels |
| ✍️ **Image → Text** | Embed UTF-8/Unicode text invisibly inside any carrier image |
| 🔍 **Image Extraction** | Perfectly recover a hidden image from an encoded carrier |
| 📝 **Text Extraction** | Recover hidden text with zero data loss |
| 🔐 **AES-256 Encryption** | Optional password-based encryption before embedding (scrypt KDF) |
| 📊 **LSB Visualization** | Inspect pixel-level bit changes to understand how steganography works |
| 🌐 **React Web UI** | Dark-mode drag-and-drop interface |
| ⚙️ **REST API** | Full Express.js API with JSON responses |
| 💻 **CLI** | Commander.js-based command-line tool |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
git clone <repo-url>
cd stegokit

# Install all dependencies
npm run install:all
```

### Running
**Change Port if in use!!!**
**Terminal 1 — Start API backend (port 5000):**
```bash
npm run backend
# → http://localhost:5000/api
```

**Terminal 2 — Start React frontend (port 5173):**
```bash
npm run frontend
# → http://localhost:5173
```

**CLI (no server needed):**
```bash
cd cli
node index.js --help
```

---

## 📁 Project Structure

```
stegokit/
├── backend/
│   ├── steganography/
│   │   └── engine.js         # Core LSB engine (framework-agnostic)
│   ├── encryption/
│   │   └── aes.js            # AES-256-CBC with scrypt KDF
│   ├── utils/
│   │   └── binary.js         # Bit-manipulation utilities
│   ├── controllers/          # One controller per endpoint
│   ├── routes/index.js       # Express route definitions
│   ├── middleware/           # Multer upload + error handler
│   └── server.js             # Express entry point
│
├── frontend/
│   └── src/
│       ├── components/       # Navbar, DropZone, CapacityMeter, …
│       ├── pages/            # Home, EncodeImage, DecodeImage, EncodeText, DecodeText, Visualize, Docs
│       └── utils/            # api.js, formatters.js
│
├── cli/
│   ├── commands/             # encode-image, decode-image, encode-text, decode-text, visualize
│   └── index.js              # Commander.js program
│
└── tests/
    ├── steganography.test.js # Engine unit tests
    ├── encryption.test.js    # AES unit tests
    └── api.test.js           # Supertest integration tests
```

---

## 🔬 LSB Algorithm

Steganography using Least Significant Bit (LSB) encoding:

```
Each pixel = [R, G, B, A] channels, each 8 bits wide.

StegoKit modifies the LSB of R, G, B channels only:
  Pixel: R=200 (11001000), G=150 (10010110), B=80 (01010000)
  Embed bits 1, 0, 1:
  R=201 (11001001) ← changed by 1
  G=150 (10010110) ← unchanged
  B=81  (01010001) ← changed by 1

Human eye cannot detect ±1 change out of 255.
```

**Header:** First 32 pixels store a 32-bit integer = payload byte count (R channel LSBs only).

**Capacity:** `floor((totalPixels − 32) × 3 / 8)` bytes.

| Image Size | Capacity |
|---|---|
| 640 × 480   | ~115 KB |
| 1920 × 1080 | ~760 KB |
| 3840 × 2160 | ~3 MB   |

---

## 🔐 Encryption Workflow

```
Password → scrypt(N=16384, r=8, p=1) → 256-bit Key
Random 16-byte Salt + Random 16-byte IV
AES-256-CBC encrypt(payload, key, iv)
Output: [salt(16)] [IV(16)] [ciphertext...]
→ Embed this buffer via LSB
```

Decoding reverses: Extract → Decrypt → Interpret.

---

## 🌐 REST API Reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Body | Description |
|---|---|---|---|
| `GET`  | `/health`        | —                                    | Health check |
| `POST` | `/encode/image`  | `carrier`, `secret`, `password?`     | Hide image in image |
| `POST` | `/decode/image`  | `encoded`, `password?`               | Extract hidden image |
| `POST` | `/encode/text`   | `carrier`, `text`, `password?`       | Hide text in image |
| `POST` | `/decode/text`   | `encoded`, `password?`               | Extract hidden text |
| `POST` | `/visualize`     | `carrier`, `encoded`, `sampleCount?` | Pixel analysis report |
| `POST` | `/encrypt`       | JSON `{ text, password }`            | AES-256 encrypt text |
| `POST` | `/decrypt`       | JSON `{ ciphertext, password }`      | AES-256 decrypt text |

All image endpoints accept `multipart/form-data`. Responses: `{ success, data, error }`.

---

## 💻 CLI Reference

```bash
# Hide image in image
node cli/index.js encode-image -c carrier.png -s secret.png -o result.png

# Hide with AES-256 encryption
node cli/index.js encode-image -c carrier.png -s secret.png -o result.png -p mypassword

# Extract hidden image
node cli/index.js decode-image -i result.png -o recovered.png

# Decrypt and extract
node cli/index.js decode-image -i result.png -o recovered.png -p mypassword

# Hide text (inline)
node cli/index.js encode-text -c carrier.png -t "Secret message" -o encoded.png

# Hide text (from file)
node cli/index.js encode-text -c carrier.png -f message.txt -o encoded.png

# Extract text to stdout
node cli/index.js decode-text -i encoded.png

# Extract text to file
node cli/index.js decode-text -i encoded.png -o output.txt

# LSB visualization (16 pixel samples)
node cli/index.js visualize -c original.png -e encoded.png -n 16
```

---

## 🧪 Running Tests

```bash
npm test
# → Jest with coverage report
```

Tests cover:
- ✅ Binary utility functions (all 8 helpers)
- ✅ Capacity calculation
- ✅ Text encode/decode (ASCII, Unicode, encrypted, error cases)
- ✅ Image encode/decode round-trips
- ✅ AES-256 encrypt/decrypt (random IV, wrong password, etc.)
- ✅ All REST API endpoints via supertest

---

## 🚢 Deployment

### Single Node service

This is the simplest production deployment for Render, Railway, Fly, or any host that runs one Node process.

```bash
npm install
npm run build
NODE_ENV=production npm start
```

The backend serves `frontend/dist` in production, so the frontend can keep the default API base of `/api`.

Required environment:

```bash
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-domain.com
```

### Separate frontend and backend

If the frontend is deployed separately, set the frontend API URL at build time:

```bash
VITE_API_URL=https://your-api-domain.com/api
VITE_BASE_PATH=/
```

For GitHub Pages project sites, also set:

```bash
VITE_BASE_PATH=/stegokit/
```

Set `CORS_ORIGIN` on the backend to the deployed frontend origin. It accepts a comma-separated list, for example:

```bash
CORS_ORIGIN=https://codeaurelius0.github.io,https://your-domain.com
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v4, React Router, Axios |
| Backend | Node.js, Express.js |
| Image Processing | Jimp |
| Encryption | Node.js `crypto` (AES-256-CBC + scrypt) |
| CLI | Commander.js, Chalk, Ora |
| Testing | Jest, Supertest |

---

## 📄 License

MIT — built for educational and production use.
