// The hand-written WordPiece must produce exactly the ids the reference tokenizer does,
// or the embeddings silently drift from what the model was trained on.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AutoTokenizer, env } from '@huggingface/transformers';
import { createTokenizer } from '../js/tokenizer.js';
import { parseBank } from '../scripts/bank.mjs';

const root = new URL('../', import.meta.url);
const ours = createTokenizer(readFileSync(new URL('models/vocab.txt', root), 'utf8'));
const { entries } = parseBank(readFileSync(new URL('qa.md', root), 'utf8'));
const { inScope, offTopic } = JSON.parse(readFileSync(new URL('eval/questions.json', root), 'utf8'));

const samples = [
  ...entries.flatMap((e) => [...e.asks, e.answer]),
  ...inScope.map((x) => x.q),
  ...offTopic,
  "What's Sam's résumé? Café naïve façade",
  'Snowflake (CTEs, window functions) + React 18/19 & Node.js',
  'UTC−7 · 800+ people · "wall of text, then abandon."',
  'supercalifragilisticexpialidocious antidisestablishmentarianism',
  '東京 and emoji 🚀 and tabs\tand\nnewlines',
  '',
];

test('matches the reference bge-base tokenizer on every bank string and edge case', async () => {
  // The reference tokenizer.json comes from models-src/ (scripts/fetch-models.sh), so this runs offline.
  env.localModelPath = new URL('models-src/', root).pathname.replace(/^\/(\w:)/, '$1');
  env.allowRemoteModels = false;
  const ref = await AutoTokenizer.from_pretrained('potion-base-4M');
  for (const s of samples) {
    const want = ref.encode(s, { add_special_tokens: false });
    assert.deepEqual(ours.encode(s), want, `mismatch on: ${JSON.stringify(s)}`);
  }
});
