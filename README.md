# byterivet

Generate **valid test files of an exact byte size** — from 1 byte to 2 GB — for testing upload limits, parsers, importers and file-handling code.

```sh
npx byterivet 10mb sample.pdf
```

Every file is structurally valid for its format (a real PDF, PNG, DOCX, ZIP, WAV…) and exactly the size you ask for, down to the byte. No dependencies, no network calls.

This is the command-line and Node.js version of the [ByteRivet test file generator](https://byterivet.com/test-files/), which runs the same engine in your browser.

## Install

```sh
npm install --save-dev byterivet   # for tests / fixtures
npm install -g byterivet           # global CLI
```

Requires Node.js 18.20 or newer.

## CLI

```sh
byterivet <size> <file> [--format <fmt>]
```

```sh
byterivet 500kb avatar.png          # PNG, exactly 512,000 bytes
byterivet 25mb report.docx
byterivet 1048577 one-byte-over.csv # one byte over a 1 MB limit
byterivet 2gb huge.bin
byterivet 5mb fixture --format zip  # format when the name has no extension
```

The format is taken from the file extension unless `--format` is given.

**Sizes** accept `b`, `kb`, `mb`, `gb` (case-insensitive, decimals allowed) or a plain byte count. Units are binary: `1 KB = 1,024 bytes`, `1 MB = 1,048,576 bytes`, `1 GB = 1,073,741,824 bytes`. For decimal sizes pass the byte count, e.g. `1000000`.

## API

```js
import { generate, parseSize, FORMATS } from 'byterivet';
import { writeFile } from 'node:fs/promises';

const pdf = await generate('pdf', '10mb');   // Uint8Array, exactly 10,485,760 bytes
await writeFile('test/fixtures/10mb.pdf', pdf);

await generate('csv', 1_000_000);            // number = bytes
parseSize('1.5mb');                          // 1572864
```

Example: testing an upload limit in a test suite.

```js
import { generate } from 'byterivet';

const atLimit = await generate('png', 5 * 1024 * 1024);
const overLimit = await generate('png', 5 * 1024 * 1024 + 1);
// expect atLimit to be accepted and overLimit to be rejected
```

## Formats

| Group | Formats |
|---|---|
| Documents | `pdf`, `docx`, `xlsx`, `txt`, `md`, `html` |
| Data | `csv`, `json`, `xml`, `sql` |
| Images | `png`, `svg` |
| Audio / video | `wav`, `mp3`, `mp4` |
| Archives / system | `zip`, `iso`, `exe`, `bat`, `bin` |

Some formats have a structural minimum (for example an ISO 9660 image cannot be smaller than 43,009 bytes); asking for less throws an error that states the minimum.

**JPG and WebP** need an image encoder (a browser canvas), so they are not in the Node package. Use the browser generator for those: [byterivet.com/test-files](https://byterivet.com/test-files/).

## How the size is made exact

Each generator builds a minimal valid file and then absorbs the remaining bytes in a place the format allows — a PDF stream, a PNG `tEXt` chunk, a stored ZIP entry, WAV sample data, and so on — so the file opens normally in standard tools while matching the requested length.

## License

MIT © [ByteRivet](https://byterivet.com)
