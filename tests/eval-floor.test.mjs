// The shipped configuration must keep its held-out score. Editing qa.md (new phrasings, reworded
// answers) can quietly make matching worse; this catches it. Floors are the 2026-10-04 scores
// (v3 = bank v2 with highlights and six new entries; v3 is the set to quote).
// Raise them when the bank improves. Never lower them to get a change through, and never edit the
// question files to pass (tests/bank.test.mjs keeps phrasings from copying them).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createEmbedder } from '../js/embed.js';
import { createMatcher } from '../js/match.js';
import { MODEL, THRESHOLD, MATCH_OPTIONS } from '../js/config.js';
import { parseBank } from '../scripts/bank.mjs';
import { score, sweep } from '../eval/score.js';

const root = new URL('../', import.meta.url);
const buf = readFileSync(new URL(`models/${MODEL}.bin`, root));
const embedder = createEmbedder(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length),
  readFileSync(new URL('models/vocab.txt', root), 'utf8'));
const { entries } = parseBank(readFileSync(new URL('qa.md', root), 'utf8'));
const matcher = createMatcher(entries, embedder, MATCH_OPTIONS);

const FLOORS = {
  'eval/questions-v3.json': { right: 47, right3: 54, rejected: 10 },
  'eval/questions-v2.json': { right: 52, right3: 59, rejected: 5 },
  'eval/questions.json': { right: 69, right3: 78, rejected: 8 },
};

for (const [file, floor] of Object.entries(FLOORS)) {
  test(`${MODEL} at ${THRESHOLD} holds its score on ${file}`, () => {
    const questions = JSON.parse(readFileSync(new URL(file, root), 'utf8'));
    const row = sweep(score(matcher, questions)).find((r) => Math.abs(Number(r.th) - THRESHOLD) < 1e-9);
    assert.ok(row, `threshold ${THRESHOLD} is not on the sweep grid`);
    for (const k of /** @type {const} */ (['right', 'right3', 'rejected'])) {
      assert.ok(row[k] >= floor[k], `${k}: ${row[k]} is below the floor ${floor[k]}`);
    }
  });
}
