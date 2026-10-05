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
- **UI:** a chat thread: `index.html`, `css/ask.css` (the portfolio Lab's night-room tokens),
  `js/app.js`. Under each question a trace shows what the model actually did: the word pieces it
  read, its 128-number vector, the comparison against every phrasing, and the top three matches
  with their scores. Matching takes under a millisecond, so the trace is paced (~1.5 s) to be
  readable, and its summary line reports the real compute time. `prefers-reduced-motion` skips the
  pacing. Answers go in with `textContent`, and every answer offers two related questions as chips.
  `?embed=1` is the mode the portfolio's Lab card uses.

## Used by the portfolio

The portfolio's glass ask bar (desertcache/portfolio, `js/ask.js`) imports `js/embed.js`,
`js/match.js` and `js/config.js` from the deployed site and fetches `data/bank.json`,
`models/vocab.txt` and `models/<MODEL>.bin`. Treat those as a public API: keep
`createEmbedder(...).{dim, pieces, embed}`, `createMatcher(...).{size, rank}` (each result with
`entry`, `score`, `matched`, `vector`) and the config exports compatible, or update the portfolio in
step. A push here deploys there too.

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

## Commands

```bash
npm ci
bash scripts/fetch-models.sh   # source models into models-src/ (gitignored)
npm run build                  # models/*.bin + data/bank.json
npm test                       # tokenizer parity, bank guards, eval floors
npm run eval -- eval/questions-v2.json
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
