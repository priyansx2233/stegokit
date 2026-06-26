/**
 * @file utils/formatters.js
 * @description Display formatting helpers for capacity, file sizes, etc.
 */

/** Format bytes to human-readable string */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/** Clamp a number between min and max */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/** Convert a File to a data URL */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Get a colour class based on capacity percentage */
export function capacityColor(pct) {
  const p = parseFloat(pct);
  if (p < 60) return '#06d6a0';  // green
  if (p < 85) return '#f59e0b';  // amber
  return '#ef4444';               // red
}
