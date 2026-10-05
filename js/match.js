// Match a question to the answer bank.
//
// Plain mean pooling lets filler ("does he", "is Sam", "what") outvote the one word that carries
// the question, because every entry is about the same person. So tokens are weighted by inverse
// document frequency over the bank itself: an entry's phrasings plus its answer form one document,
// a token in nearly every entry ("he") weighs almost nothing, and a token the bank never uses
// ("paramedic") gets full weight and lands near the bank words it means ("emt").
// An entry scores as its best-matching phrasing, or its answer when `answers` is on.

/**
 * @typedef {{ id: string, chat?: boolean, asks: string[], answer: string, link: string | null }} Entry
 * @typedef {{ tokens(text: string): number[], embed(text: string, weight?: (id: number) => number): Float32Array }} Embedder
 * @typedef {{ idf?: boolean, answers?: boolean }} MatchOptions
 */

/**
 * The answer to show, or null to decline. A real answer needs `threshold`; small talk (entries
 * marked chat) needs the stronger `chatMin`, so "translate hello" doesn't get a greeting. A chat
 * entry that falls short steps aside for the next real answer instead of blocking it.
 * The eval scorer uses this same rule, so the held-out scores measure what visitors see.
 * @template {{ entry: Entry, score: number }} R
 * @param {R[]} ranked
 * @param {number} threshold
 * @param {number} [chatMin]
 * @returns {R | null}
 */
export function bestMatch(ranked, threshold, chatMin = 0.6) {
  for (const r of ranked) {
    if (r.score < threshold) return null;
    if (!r.entry.chat || r.score >= chatMin) return r;
  }
  return null;
}

/** @param {Float32Array} a @param {Float32Array} b */
function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

/**
 * @param {Entry[]} entries
 * @param {Embedder} embedder
 * @param {MatchOptions} [opts]
 */
export function createMatcher(entries, embedder, { idf = true, answers = true } = {}) {
  /** @type {((id: number) => number) | undefined} */
  let weight;
  if (idf) {
    /** @type {Map<number, number>} */
    const df = new Map();
    for (const e of entries) {
      for (const id of new Set([...e.asks, e.answer].flatMap((t) => embedder.tokens(t)))) df.set(id, (df.get(id) ?? 0) + 1);
    }
    const n = entries.length;
    weight = (id) => Math.log((n + 1) / ((df.get(id) ?? 0) + 1));
  }
  const index = entries.map((e) => {
    const texts = [...e.asks, ...(answers ? [e.answer] : [])];
    return { entry: e, texts, vecs: texts.map((t) => embedder.embed(t, weight)) };
  });

  return {
    /** How many texts a question is compared against. */
    size: index.reduce((n, { vecs }) => n + vecs.length, 0),
    /**
     * Entries ranked by score, best first, each with the phrasing that scored it.
     * @param {string} question
     * @returns {{ entry: Entry, score: number, matched: string, vector: Float32Array }[]}
     */
    rank(question) {
      const q = embedder.embed(question, weight);
      return index
        .map(({ entry, texts, vecs }) => {
          let best = 0;
          const scores = vecs.map((v) => dot(q, v));
          scores.forEach((s, i) => { if (s > scores[best]) best = i; });
          return { entry, score: scores[best], matched: texts[best], vector: q };
        })
        .sort((x, y) => y.score - x.score);
    },
  };
}
