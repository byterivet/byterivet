import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generate, parseSize, FORMATS } from '../lib/index.js';

const MAGIC = {
  pdf: '%PDF', png: '\x89PNG', zip: 'PK', docx: 'PK', xlsx: 'PK', wav: 'RIFF', exe: 'MZ',
};

test('parseSize', () => {
  assert.equal(parseSize('10mb'), 10485760);
  assert.equal(parseSize('512 KB'), 524288);
  assert.equal(parseSize('1048576'), 1048576);
  assert.equal(parseSize('1.5kb'), 1536);
  assert.throws(() => parseSize('3gb'));
  assert.throws(() => parseSize('ten'));
});

const SIZES = [50000, 100000, 1048576, 1048577, 5 * 1048576 + 3];
for (const fmt of FORMATS) {
  test(`${fmt} exact sizes`, async () => {
    for (const n of SIZES) {
      const d = await generate(fmt, n);
      assert.equal(d.length, n, `${fmt} @ ${n}`);
      if (MAGIC[fmt]) assert.equal(Buffer.from(d.subarray(0, MAGIC[fmt].length)).toString('latin1'), MAGIC[fmt]);
    }
  });
}

test('jpg/webp give a helpful error', async () => {
  await assert.rejects(generate('jpg', 4096), /browser canvas/);
});
