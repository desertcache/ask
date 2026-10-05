# Ask about my work

An answer finder for [Sam Bates's portfolio](https://desertcache.github.io/portfolio/). A 3.9 MB
embedding model runs on the visitor's device and matches their question, by meaning, to one of 50
answers Sam reviewed and approved (each a lead, 2 to 4 highlights and two curated follow-ups). Nothing is generated, so it cannot invent a fact, and the
question never leaves the browser. No server, no API key, no inference engine: about 4.3 MB total,
ready in well under a second, matching in under a millisecond.

## How it works

- **Model:** [`minishlab/potion-base-4M`](https://huggingface.co/minishlab/potion-base-4M) (MIT),
  a model2vec static embedding model distilled from bge-base-en-v1.5. Each token id maps to one
  128-dim vector, and a sentence is the normalized mean of its token vectors. `scripts/build.mjs`
  quantizes the fp32 table to int8 rows with per-row scales (15 MB to 3.9 MB).
- **Tokenizer:** `js/tokenizer.js`, a hand-written BERT uncased WordPiece. `tests/tokenizer.test.mjs`
  checks it id-for-id against the reference tokenizer on every bank string plus edge cases.
- **Matching:** `js/match.js`. An entry scores as its best-matching sample phrasing. Below the
  threshold (0.45) the box shows the fallback, which points to email.
- **Conversation:** `js/converse.js` decides each turn, still without generating anything. It
  repairs typos against the bank's own words (only when that improves the match), reads "Sam" as
  "he" when that matches better (most phrasings say "he"), splits two questions in one message when
  each half confidently matches a different answer, and reads a follow-up ("how long did that
  take?") against the last answer: it gets the one sentence of that answer that fits best, or the
  linked answer it points to. "Tell me more" walks the answers Sam linked, skipping ones already
  shown. When nothing clears the bar but one answer comes close and shares a telling word with the
  question, it asks "Did you mean" instead of a flat no. Every step it takes is listed in the trace.
- **UI:** a chat thread: `index.html`, `css/ask.css` (the portfolio Lab's night-room tokens),
  `js/app.js`. Under each question a trace shows what the model actually did: the word pieces it
  read, its 128-number vector, the comparison against every phrasing, the top three matches with
  their scores, and any conversation step (a typo fixed, a split, a follow-up). Matching takes
  under a millisecond, so the trace is paced (~3 s) to be readable, and its summary line reports the
  real compute time. `prefers-reduced-motion` skips the pacing. Answers go in with `textContent`,
  and every answer offers two related questions as chips. `?embed=1` is the mode the portfolio's
  Lab card uses.

## Used by the portfolio

The portfolio's glass ask bar (desertcache/portfolio, `js/ask.js`) imports `js/embed.js`,
`js/match.js` and `js/config.js` from the deployed site and fetches `data/bank.json`,
`models/vocab.txt` and `models/<MODEL>.bin`. Treat those as a public API: keep
`createEmbedder(...).{dim, pieces, embed}`, `createMatcher(...).{size, rank}` (each result with
`entry`, `score`, `matched`, `vector`), the bank entry fields (`answer`, then `detail` paragraphs or
`points`, `next`, `link`) and the config exports compatible, or update the portfolio in
step. A push here deploys there too.

It also imports `js/converse.js`, falling back to plain matching if that fails to load:

- `createConversation({ entries, matcher, embedder, threshold, chatMin, bestMatch, fallbacks?, starters?, voice? })`
  returns `{ turn(message), reset() }`. `voice` is `'first'` ("so I won't guess", this page) or
  `'third'` ("so it won't guess", the portfolio's bar). The module imports nothing, so a cached
  `match.js` can never break it; the caller passes `bestMatch` in.
- `turn(message)` returns a Turn: `kind` (`answer`, `more`, `followup`, `two`, `clarify` or `none`),
  `query` (after typo repair), `fixes`, `ranked` and `best` (the plain ranking), `steps` (the trace,
  in order: `{ title, detail?, view? }`, where `view` is `{ type: 'pieces', text }`,
  `{ type: 'vector', vector }` or `{ type: 'ranked', rows: [{ text, score, best }] }`), `parts`
  (`[{ entry, aside, lines }]`: one, or two for a two-part question; `lines` null means the whole
  answer, else just those sentences of it), `message` (the "Did you mean" line or a fallback, when
  there are no parts), `suggest` (the chips) and `ms` (the real compute time).

## The answer bank

`qa.md` is the single source. Each entry has sample phrasings ("Asks like"), the answer and a link
into the portfolio. Run `npm run build` after editing it to regenerate `data/bank.json`.

Every fact comes from the live portfolio, answers are in the third person, and nothing is said that
the portfolio doesn't already say.

## Evaluation (2026-10-04)

Two held-out question sets, both written before the runs they score:
`eval/questions.json` (88 in-scope + 15 off-topic), `eval/questions-v2.json` (66 + 10) and
`eval/questions-v3.json` (58 + 10, written for bank v2 before its final edits were scored: the number
to quote). On v3 the shipped bank puts the right answer first 47/58 (81%), in the top 3 54/58 (93%),
and declines 10/10 off-topic questions. A guard test fails if any phrasing in `qa.md`
copies or nearly copies a test question.

| Model (shipped size) | v2: right first | v2: right in top 3 | v2: off-topic declined |
|---|---|---|---|
| **potion-base-4M (3.9 MB), shipped** | **52/66 (79%)** | **59/66 (89%)** | 5/10 |
| potion-base-8M (7.7 MB) | 47-48/66 | 59-62/66 | 5-7/10 |
| potion-base-2M (2.0 MB) | 44/66 | 54-59/66 | 6-8/10 |

The transformer baselines (run in Chrome on WASM, `eval/browser.html`, scored on v1 before the
phrasing pass) were only slightly better on in-scope questions and much better at declining off-topic
ones, at 5-12x the download: MiniLM-L6 65/88 first and 76/88 top-3 (~37 MB raw); bge-small 69/88 and
79/88 (~48 MB raw). potion-4M scored 69/88 and 78/88 on v1 after the phrasing pass. Off-topic misses
are low-harm here: the box can only ever show an approved answer.

`tests/eval-floor.test.mjs` pins the shipped scores so a bank edit cannot quietly make matching worse.

### Conversations (2026-10-05)

Thresholds were tuned on a separate dev set (kept outside this repo). Each conversation set was then
written blind (answer text only, never the phrasings or the code) by an agent, and scored once. Each
holds 30 two-turn conversations (15 about the answer just shown, 5 pointing to a different answer, 5
changing the subject, 5 that no answer covers), 15 two-part messages, 8 single questions that only
look like two, 18 typo'd questions and 10 off-topic ones. The baseline is this box before
`js/converse.js`, scored the same way.

Two rounds of the repo's usual rule (a set you have looked at is no longer held out):
`eval/questions-converse.json` was scored first; it and a browser test showed that a pronoun inside
a new question ("the POS partner shut down its API") was read as a follow-up. After that fix,
`eval/questions-converse-v2.json` was scored once and showed the same thing in other shapes ("does
phoenix move its clocks", "and what are his pay expectations?"), so its brief and the fix both
covered them. `eval/questions-converse-v3.json` was written after the last fix and scored once on the
shipped code. **It is the number to quote:**

| `eval/questions-converse-v3.json` | Before | With the conversation layer |
|---|---|---|
| Typo'd questions answered right | 8/18 | **16/18** |
| Two-part messages, both answered | 0/15 | **10/15** |
| Follow-ups on the answer just shown | 1/15 | **6/15** (5 as the exact sentence) |
| All follow-ups | 8/30 | **10/30** |
| ...pointing to another answer / changing the subject / that nothing covers | 3/5, 3/5, 1/5 | 2/5, 2/5, 0/5 |
| Single questions answered right and left whole | 7/8 | 6/8 (one split in two) |
| Off-topic declined | 4/10 | 4/10, with no "Did you mean" chips |

So it trades a small loss on new subjects and unanswerable follow-ups for large gains on typos,
two-part messages and follow-ups about the answer just shown (46 of its 81 scored messages right, up
from 27). The weak spots are known: a new question can still be read as a follow-up when a pronoun in it
seems to point back ("so what timezone is he in, and does it change?"), and a follow-up that no
answer covers gets the closest sentence instead of a decline. That is why the trace says "Picked the
line that fits best", never that the line answers the question. The older single-question sets lose
nothing through the layer, and tests pin all of these scores.

## Commands

```bash
npm ci
bash scripts/fetch-models.sh   # source models into models-src/ (gitignored)
npm run build                  # models/*.bin + data/bank.json
npm test                       # tokenizer parity, bank guards, eval floors
npm run eval -- eval/questions-v2.json
node eval/converse.mjs eval/questions-converse-v3.json [--baseline]  # a conversation set
node eval/converse.mjs --brain # the single-question sets, through the conversation layer
node scripts/serve.mjs 8093    # then open http://localhost:8093/
node scripts/ui-check.mjs out/ # isolated headless Chrome: desktop + phone screenshots, bytes, errors
node scripts/browser-eval.mjs  # transformer baselines in Chrome (needs the server)
```

## Credits

The shipped model is [potion-base-4M](https://huggingface.co/minishlab/potion-base-4M) by
[Minish Lab](https://github.com/MinishLab/model2vec), MIT License, quantized to int8 here. Its
vocabulary (`models/vocab.txt`) comes from BAAI's bge-base-en-v1.5 (MIT License).

## Notes

On Windows, Node can load `C:\Windows\System32\onnxruntime.dll` (1.17) over the bundled one and
segfault, which is why the transformer baselines run in the browser.
