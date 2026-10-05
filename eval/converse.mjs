// Score the conversation layer (js/converse.js) in Node with the shipped model and bank.
// Usage:
//   node eval/converse.mjs <set.json> [--rows] [--set key=value,...]   a conversation set
//   node eval/converse.mjs --brain [--rows] [--set ...]                the single-question sets,
//                                                                      through the conversation
// --set overrides TUNING for a run (e.g. --set followMin=0.32,stay=0.08): tune on the dev set only.
// --baseline scores the box as it was before the conversation layer, for comparison.

import { readFileSync } from 'node:fs';
import { createEmbedder } from '../js/embed.js';
import { createMatcher, bestMatch } from '../js/match.js';
import { createConversation } from '../js/converse.js';
import { MODEL, THRESHOLD, CHAT_MIN, MATCH_OPTIONS } from '../js/config.js';
import { parseBank } from '../scripts/bank.mjs';
import { scoreConverse, scoreSingles, legacyConversation } from './converse-score.js';

const root = new URL('../', import.meta.url);
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const si = args.indexOf('--set');
const tuning = si >= 0 ? Object.fromEntries(args[si + 1].split(',').map((kv) => { const [k, v] = kv.split('='); return [k, Number(v)]; })) : {};

const { entries, fallbacks } = parseBank(readFileSync(new URL('qa.md', root), 'utf8'));
const buf = readFileSync(new URL(`models/${MODEL}.bin`, root));
const embedder = createEmbedder(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length), readFileSync(new URL('models/vocab.txt', root), 'utf8'));
const matcher = createMatcher(entries, embedder, MATCH_OPTIONS);
const fresh = flag('--baseline')
  ? () => legacyConversation({ entries, matcher, threshold: THRESHOLD, chatMin: CHAT_MIN, bestMatch })
  : () => createConversation({ entries, matcher, embedder, threshold: THRESHOLD, chatMin: CHAT_MIN, bestMatch, fallbacks, tuning, random: () => 0 });

if (flag('--brain')) {
  for (const file of ['eval/questions.json', 'eval/questions-v2.json', 'eval/questions-v3.json', 'eval/questions-nav.json']) {
    const r = scoreSingles(fresh, JSON.parse(readFileSync(new URL(file, root), 'utf8')));
    console.log(`${file.padEnd(26)} right ${r.right}  top3 ${r.right3}  declined ${r.rejected}  (of ${r.of})  split ${r.split}  typo-fixed ${r.fixed}  did-you-mean: in-scope ${r.clarifyIn} (right chip ${r.clarifyHit}), off-topic ${r.clarifyOff}`);
    if (flag('--rows')) console.log(r.misses.map((m) => `    ${m}`).join('\n'));
  }
} else {
  const file = args.find((a) => a.endsWith('.json'));
  if (!file) throw new Error('usage: node eval/converse.mjs <set.json> [--rows] [--set k=v,...] | --brain');
  const r = scoreConverse(fresh, JSON.parse(readFileSync(file, 'utf8')));
  const f = r.followups;
  const pct = (a, b) => `${a}/${b}${b ? ` (${Math.round((100 * a) / b)}%)` : ''}`;
  console.log(`follow-ups   turn 2 right ${pct(f.t2, f.n)}   turn 1 right ${pct(f.t1, f.n)}   turn 2 when turn 1 was right ${pct(f.t2GivenT1, f.nT1)}`);
  for (const [k, v] of Object.entries(f.byType)) console.log(`  ${k.padEnd(8)} ${pct(v.right, v.n)}${k === 'same' ? `   one line only ${pct(v.focused, v.n)}` : ''}`);
  console.log(`two-part     both answered ${pct(r.twoPart.both, r.twoPart.n)}   only one ${r.twoPart.one}`);
  console.log(`and-singles  right, not split ${pct(r.andSingles.right, r.andSingles.n)}   split ${r.andSingles.split}`);
  console.log(`typos        right ${pct(r.typos.right, r.typos.n)}   repaired ${r.typos.fixed}`);
  console.log(`off-topic    declined ${pct(r.offTopic.declined, r.offTopic.n)}   with chips ${r.offTopic.chips} (far ${r.offTopic.farChips})`);
  if (flag('--rows')) for (const row of r.rows) console.log(`${row.ok ? 'ok  ' : 'MISS'} ${row.list.padEnd(9)} ${(row.type ?? '').padEnd(7)} ${row.q.slice(0, 80).padEnd(80)} -> ${row.got}   want ${row.want}${row.note ? `   (${row.note})` : ''}`);
}
