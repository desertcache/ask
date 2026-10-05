// Build the shipped files:
//   models/<name>.bin + models/vocab.txt  from models-src/<name>/ (fp32 safetensors -> int8 rows + scales)
//   data/bank.json                        from qa.md
// Usage: node scripts/build.mjs [model names...]   (default: every potion-* folder in models-src/)

import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { parseBank } from './bank.mjs';

const root = new URL('../', import.meta.url);
const names = process.argv.slice(2).length ? process.argv.slice(2)
  : readdirSync(new URL('models-src/', root)).filter((n) => n.startsWith('potion-'));

mkdirSync(new URL('models/', root), { recursive: true });
mkdirSync(new URL('data/', root), { recursive: true });

for (const name of names) {
  const src = readFileSync(new URL(`models-src/${name}/model.safetensors`, root));
  const headerLen = Number(src.readBigUInt64LE(0));
  const header = JSON.parse(src.subarray(8, 8 + headerLen).toString('utf8'));
  const t = header.embeddings;
  if (!t || t.dtype !== 'F32') throw new Error(`${name}: expected an F32 "embeddings" tensor`);
  const [rows, dim] = t.shape;
  const start = 8 + headerLen + t.data_offsets[0];
  const f32 = new Float32Array(src.buffer.slice(src.byteOffset + start, src.byteOffset + start + rows * dim * 4));

  const out = Buffer.alloc(8 + rows * 4 + rows * dim);
  out.writeUInt32LE(rows, 0);
  out.writeUInt32LE(dim, 4);
  for (let r = 0; r < rows; r++) {
    let max = 0;
    for (let j = 0; j < dim; j++) max = Math.max(max, Math.abs(f32[r * dim + j]));
    const scale = max / 127 || 1;
    out.writeFloatLE(scale, 8 + r * 4);
    for (let j = 0; j < dim; j++) out.writeInt8(Math.round(f32[r * dim + j] / scale), 8 + rows * 4 + r * dim + j);
  }
  writeFileSync(new URL(`models/${name}.bin`, root), out);
  console.log(`models/${name}.bin  ${rows}x${dim}  ${(out.length / 1e6).toFixed(2)} MB`);
}
// All three potion sizes share bge-base's vocab, so one copy ships.
copyFileSync(new URL(`models-src/${names[0]}/vocab.txt`, root), new URL('models/vocab.txt', root));

const bank = parseBank(readFileSync(new URL('qa.md', root), 'utf8'));
writeFileSync(new URL('data/bank.json', root), JSON.stringify(bank, null, 1) + '\n');
console.log(`data/bank.json  ${bank.entries.length} entries, ${bank.entries.reduce((n, e) => n + e.asks.length, 0)} phrasings`);
