// Regenerates lib/generators.js from the ByteRivet site source.
// Usage: node scripts/sync.mjs [path/to/apps/public/src/index.html]
import { readFileSync, writeFileSync } from 'node:fs';
const src = process.argv[2] || '../bytesmith/apps/public/src/index.html';
const m = readFileSync(src, 'utf8').match(/<script id="worker-src" type="text\/js-worker">([\s\S]*?)<\/script>/);
if (!m) throw new Error('worker-src block not found in ' + src);
const body = m[1].split(/^self\.onmessage = /m)[0];
writeFileSync('lib/generators.js',
  '// Generated from the ByteRivet web generator (https://byterivet.com/test-files/).\n' +
  '// Do not edit by hand: run `npm run sync` after changing the site source.\n' + body +
  "export const FORMATS = ['pdf','png','svg','txt','csv','json','xml','html','sql','md','bat','zip','docx','xlsx','wav','mp3','mp4','bin','exe','iso'];\n" +
  'export { generate };\n');
console.log('lib/generators.js updated');
