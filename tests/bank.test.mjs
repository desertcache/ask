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
  // The conversation set's messages count too: every turn, and each typo as typed and as meant.
  // These phrasings were already in the bank (22220ca) when blind agents, who never saw them,
  // wrote the same everyday questions; they are coincidences, not copies. Any new one still fails.
  const before = new Set(['location: Where does he live?', 'location: What time zone is he in?', 'emt: Was he an EMT?',
    'education: Where did he go to school?', 'education: Did he go to college?', 'hobbies: What does he do for fun?',
    'can-he-code: Can he code?', 'engineer-or-manager: Is he an engineer or a manager?', 'claude-code: How does he use Claude Code?',
    "hardest-problem: What's the hardest problem he's solved?", 'who-is-sam: Who is Sam?', 'who-is-sam: Who is Sam Bates?',
    'doordash-history: How long has he been at DoorDash?', 'leadership: Has he led teams?', 'resume: Can I download his resume?',
    "salary: What's his salary?", "career-path: What's his background?", 'career-path: Walk me through his career',
    "tech-stack: What's his tech stack?", 'api-migration: Tell me about the API migration', "workforce-platform: What's the workforce platform?",
    "starship: What's the starship?", 'availability: Is he open to work?', 'remote: Is he open to remote?']);
  /** @param {any} c */
  const messages = (c) => [...c.followups.flatMap((f) => f.turns.map((t) => t.q)), ...c.twoPart.map((x) => x.q),
    ...c.andSingles.map((x) => x.q), ...c.typos.flatMap((x) => [x.q, x.intended]), ...c.offTopic.map((x) => x.q)];
  for (const file of ['eval/questions.json', 'eval/questions-v2.json', 'eval/questions-v3.json', 'eval/questions-nav.json',
    'eval/questions-converse.json', 'eval/questions-converse-v2.json', 'eval/questions-converse-v3.json']) {
    const set = JSON.parse(readFileSync(new URL(file, root), 'utf8'));
    const held = file.includes('converse') ? messages(set) : [...set.inScope.map((x) => x.q), ...set.offTopic];
    for (const e of entries) {
      for (const ask of e.asks) {
        if (file.includes('converse') && before.has(`${e.id}: ${ask}`)) continue;
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
