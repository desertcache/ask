// Score the static (potion) models on the held-out set in Node.
// The transformer models run in eval/browser.html instead: on this machine Node loads Windows'
// own System32\onnxruntime.dll (1.17) over the bundled one and segfaults.
// Usage: node eval/run.mjs [questions.json] [--misses <model> <threshold> [variant]]

import { readFileSync } from 'node:fs';
import { createEmbedder } from '../js/embed.js';
import { createMatcher } from '../js/match.js';
import { parseBank } from '../scripts/bank.mjs';
import { VARIANTS, score, sweep, formatSweep, misses } from './score.js';

const root = new URL('../', import.meta.url);
const args = process.argv.slice(2);
const qfile = args[0]?.endsWith('.json') ? args[0] : 'eval/questions.json';
const { entries } = parseBank(readFileSync(new URL('qa.md', root), 'utf8'));
const questions = JSON.parse(readFileSync(new URL(qfile, root), 'utf8'));
const vocab = readFileSync(new URL('models/vocab.txt', root), 'utf8');

function loadStatic(name) {
  const buf = readFileSync(new URL(`models/${name}.bin`, root));
  return createEmbedder(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length), vocab);
}

const names = ['potion-base-2M', 'potion-base-4M', 'potion-base-8M'];
const mi = args.indexOf('--misses');
if (mi >= 0) {
  const [name, th, v = 'idf+answers'] = [args[mi + 1], Number(args[mi + 2]), args[mi + 3]];
  console.log(misses(score(createMatcher(entries, loadStatic(name), VARIANTS[v]), questions), th));
} else {
  for (const name of names) {
    const embedder = loadStatic(name);
    for (const [v, opts] of Object.entries(VARIANTS)) {
      console.log(formatSweep(`${name}  [${v}]`, sweep(score(createMatcher(entries, embedder, opts), questions))));
    }
  }
}
