// Where does the conversation layer answer a single question differently from the plain matcher?
// Usage: node eval/converse-diff.mjs <questions.json>... [--set key=value,...]
import { readFileSync } from 'node:fs';
import { createEmbedder } from '../js/embed.js';
import { createMatcher, bestMatch } from '../js/match.js';
import { createConversation } from '../js/converse.js';
import { MODEL, THRESHOLD, CHAT_MIN, MATCH_OPTIONS } from '../js/config.js';
import { parseBank } from '../scripts/bank.mjs';
import { describe } from './converse-score.js';

const root = new URL('../', import.meta.url);
const args = process.argv.slice(2);
const si = args.indexOf('--set');
const tuning = si >= 0 ? Object.fromEntries(args[si + 1].split(',').map((kv) => { const [k, v] = kv.split('='); return [k, Number(v)]; })) : {};
const { entries } = parseBank(readFileSync(new URL('qa.md', root), 'utf8'));
const buf = readFileSync(new URL(`models/${MODEL}.bin`, root));
const embedder = createEmbedder(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length), readFileSync(new URL('models/vocab.txt', root), 'utf8'));
const matcher = createMatcher(entries, embedder, MATCH_OPTIONS);
const fresh = () => createConversation({ entries, matcher, embedder, threshold: THRESHOLD, chatMin: CHAT_MIN, bestMatch, tuning });

for (const file of args.filter((a) => a.endsWith('.json'))) {
  const { inScope, offTopic } = JSON.parse(readFileSync(new URL(file, root), 'utf8'));
  console.log(`-- ${file}`);
  for (const { q, expect } of [...inScope, ...offTopic.map((q) => ({ q, expect: ['none'] }))]) {
    const plain = bestMatch(matcher.rank(q), THRESHOLD, CHAT_MIN);
    const t = fresh().turn(q);
    const was = plain ? plain.entry.id : 'none';
    const now = t.kind === 'none' || t.kind === 'clarify' ? 'none' : t.parts[0].entry.id;
    if (was !== now || t.kind === 'two' || t.fixes.length) {
      const mark = expect.includes(now) && !expect.includes(was) ? 'GAIN' : !expect.includes(now) && expect.includes(was) ? 'LOSS' : 'same';
      console.log(`  ${mark}  ${q.slice(0, 64).padEnd(64)} matcher ${was.padEnd(16)} brain ${describe(t)}   want ${expect.join('|')}`);
    }
  }
}
