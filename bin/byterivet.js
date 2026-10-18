#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { generate, parseSize, FORMATS } from '../lib/index.js';

const HELP = `Usage: byterivet <size> <file> [--format <fmt>]

Generate a valid test file of an exact byte size (1 byte to 2 GB).

Examples:
  byterivet 10mb sample.pdf
  byterivet 500kb upload-test.png
  byterivet 1048576 data.csv
  byterivet 2gb big.bin
  byterivet 25mb fixture --format zip

Sizes: b, kb, mb, gb (1 MB = 1,048,576 bytes) or a plain byte count.
Formats: ${FORMATS.join(', ')}
JPG and WebP: https://byterivet.com/test-files/ (needs a browser canvas)`;

const args = process.argv.slice(2);
if (!args.length || args.includes('-h') || args.includes('--help')) { console.log(HELP); process.exit(args.length ? 0 : 1); }
if (args.includes('-v') || args.includes('--version')) {
  const { default: pkg } = await import('../package.json', { with: { type: 'json' } });
  console.log(pkg.version); process.exit(0);
}

let format;
const fi = args.findIndex(a => a === '-f' || a === '--format');
if (fi !== -1) { format = args[fi + 1]; args.splice(fi, 2); }
const [sizeArg, file] = args;
if (!sizeArg || !file) { console.error(HELP); process.exit(1); }

try {
  const bytes = parseSize(sizeArg);
  format ||= extname(file).slice(1);
  if (!format) throw new Error('Cannot infer format from file name; pass --format <fmt>.');
  const t0 = Date.now();
  const data = await generate(format, bytes);
  await writeFile(file, data);
  console.log(`${file}: ${data.length.toLocaleString('en-US')} bytes (${format.toLowerCase()}) in ${Date.now() - t0} ms`);
} catch (err) {
  console.error('byterivet: ' + err.message);
  process.exit(1);
}
