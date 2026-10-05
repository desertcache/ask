// The shipped configuration must keep its held-out score. Editing qa.md (new phrasings, reworded
// answers) can quietly make matching worse; this catches it. Floors are the 2026-10-04 scores
// (v3 = bank v2 with highlights and six new entries; v3 is the set to quote). The nav set (2026-10-05)
// scores start-here on "orient me" questions, and its near misses keep that generic entry in check.
// Raise them when the bank improves. Never lower them to get a change through, and never edit the
// question files to pass (tests/bank.test.mjs keeps phrasings from copying them).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createEmbedder } from '../js/embed.js';
import { createMatcher, bestMatch } from '../js/match.js';
import { createConversation } from '../js/converse.js';
import { MODEL, THRESHOLD, CHAT_MIN, MATCH_OPTIONS } from '../js/config.js';
import { parseBank } from '../scripts/bank.mjs';
import { score, sweep } from '../eval/score.js';
import { scoreConverse, scoreSingles } from '../eval/converse-score.js';

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
  'eval/questions-nav.json': { right: 11, right3: 13, rejected: 4 },
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

// The same sets through the conversation layer (js/converse.js), which is what visitors get: typo
// repair, reading "Sam" as "he" and two-part splitting must never cost a single question. These sets
// were seen while the layer was built, so these floors guard it but are not numbers to quote.
const fresh = () => createConversation({ entries, matcher, embedder, threshold: THRESHOLD, chatMin: CHAT_MIN, bestMatch, random: () => 0 });
const BRAIN_FLOORS = {
  'eval/questions-v3.json': { right: 50, right3: 54, rejected: 10 },
  'eval/questions-v2.json': { right: 54, right3: 60, rejected: 5 },
  'eval/questions.json': { right: 72, right3: 78, rejected: 8 },
  'eval/questions-nav.json': { right: 11, right3: 13, rejected: 4 },
};
for (const [file, floor] of Object.entries(BRAIN_FLOORS)) {
  test(`the conversation layer holds its score on ${file}, and splits none of it`, () => {
    const r = scoreSingles(fresh, JSON.parse(readFileSync(new URL(file, root), 'utf8')));
    for (const k of /** @type {const} */ (['right', 'right3', 'rejected'])) {
      assert.ok(r[k] >= floor[k], `${k}: ${r[k]} is below the floor ${floor[k]}`);
    }
    assert.equal(r.split, 0, 'a single question was split in two');
  });
}

// The conversation sets (2026-10-05), each written blind from the answer text only (README.md,
// Evaluation). v1 and v2 were each scored once and then looked at to find the next fix, so they are
// floors, not numbers to quote. v3 was scored once on the shipped code: the number to quote.
const CONVERSE_FLOORS = {
  'eval/questions-converse.json': { followups: 12, sameLine: 5, two: 10, singles: 8, typos: 17, declined: 3, maxSplit: 0 },
  'eval/questions-converse-v2.json': { followups: 19, sameLine: 8, two: 13, singles: 6, typos: 16, declined: 3, maxSplit: 0 },
  'eval/questions-converse-v3.json': { followups: 10, sameLine: 5, two: 10, singles: 6, typos: 16, declined: 4, maxSplit: 1 },
};
for (const [file, { maxSplit, ...floor }] of Object.entries(CONVERSE_FLOORS)) {
  test(`the conversation layer holds its score on ${file}`, () => {
    const r = scoreConverse(fresh, JSON.parse(readFileSync(new URL(file, root), 'utf8')));
    const got = { followups: r.followups.t2, sameLine: r.followups.byType.same.focused, two: r.twoPart.both, singles: r.andSingles.right, typos: r.typos.right, declined: r.offTopic.declined };
    for (const [k, v] of Object.entries(floor)) assert.ok(got[k] >= v, `${k}: ${got[k]} is below the floor ${v}`);
    assert.ok(r.andSingles.split <= maxSplit, `${r.andSingles.split} single questions were split in two (at most ${maxSplit})`);
    assert.equal(r.offTopic.farChips, 0, 'an unrelated question got "Did you mean" chips');
  });
}
