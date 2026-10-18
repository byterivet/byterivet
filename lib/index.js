import { generate as gen, FORMATS } from './generators.js';

export { FORMATS };

const UNITS = { b: 1, kb: 1024, kib: 1024, mb: 1024 ** 2, mib: 1024 ** 2, gb: 1024 ** 3, gib: 1024 ** 3 };
export const MAX_BYTES = 2 * 1024 ** 3;

/** Parse "10mb", "512 KB", "1.5gb" or "1048576" into bytes (1 MB = 1,048,576 bytes). */
export function parseSize(input) {
  const m = String(input).trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|kib|mb|mib|gb|gib)?$/);
  if (!m) throw new Error(`Invalid size: "${input}". Use e.g. 500kb, 10mb, 1gb or a byte count.`);
  const bytes = Math.round(parseFloat(m[1]) * UNITS[m[2] || 'b']);
  if (bytes < 1 || bytes > MAX_BYTES) throw new Error(`Size must be between 1 byte and 2 GB (got ${bytes}).`);
  return bytes;
}

/** Generate a structurally valid file of exactly `size` bytes. Returns a Uint8Array. */
export async function generate(format, size, options = {}) {
  const fmt = String(format).toLowerCase().replace(/^\./, '').replace(/^jpeg$/, 'jpg');
  if (!FORMATS.includes(fmt)) {
    const hint = fmt === 'jpg' || fmt === 'webp' ? ' JPG/WebP need a browser canvas: use https://byterivet.com/test-files/' : '';
    throw new Error(`Unsupported format "${format}". Supported: ${FORMATS.join(', ')}.${hint}`);
  }
  const bytes = typeof size === 'number' ? size : parseSize(size);
  const data = await gen(fmt, bytes, options, () => {});
  if (data.length !== bytes) throw new Error(`Size mismatch for ${fmt}: ${data.length} vs ${bytes}`);
  return data;
}
