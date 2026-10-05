import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseBank } from '../scripts/bank.mjs';

const root = new URL('../', import.meta.url);
const md = readFileSync(new URL('qa.md', root), 'utf8');
const { entries, fallback } = parseBank(md);
const words = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
const norm = (s) => words(s).join(' ');

test('every entry has an id, phrasings and an answer; the fallback exists', () => {
  assert.ok(entries.length >= 40);
  for (const e of entries) {
    assert.match(e.id, /^[a-z0-9-]+$/);
    assert.ok(e.asks.length >= 3, `${e.id} needs at least 3 phrasings`);
    assert.ok(e.answer.length > 20, `${e.id} answer is too short`);
  }
  assert.ok(fallback.includes('batessambates@gmail.com'));
});

test('no phrasing copies or nearly copies a held-out test question', () => {
  // The eval sets measure how well the bank generalizes. A phrasing lifted from them makes the
  // score a lie, so near-duplicates (same words, any order, at most one word different) fail too.
  const hits = [];
  for (const file of ['eval/questions.json', 'eval/questions-v2.json']) {
    const { inScope, offTopic } = JSON.parse(readFileSync(new URL(file, root), 'utf8'));
    const held = [...inScope.map((x) => x.q), ...offTopic];
    for (const e of entries) {
      for (const ask of e.asks) {
        const a = new Set(words(ask));
        for (const q of held) {
          const b = new Set(words(q));
          const shared = [...a].filter((w) => b.has(w)).length;
          const union = new Set([...a, ...b]).size;
          if (norm(ask) === norm(q) || (a.size >= 2 && union - shared <= 1)) hits.push(`${e.id}: "${ask}" ~ ${file}: "${q}"`);
        }
      }
    }
  }
  assert.deepEqual(hits, []);
});

test('shipped text has no em dashes', () => {
  const shipped = entries.flatMap((e) => [...e.asks, e.answer]).concat(fallback).join('\n');
  assert.ok(!shipped.includes('—'), 'em dash in shipped text');
});
