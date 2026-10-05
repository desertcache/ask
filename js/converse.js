// The conversation: everything the box does between a visitor's message and the answer it shows.
//
// The honesty line: nothing here generates text. Every answer is a bank entry Sam approved, or whole
// sentences from one, and every step taken is listed in the turn's trace, which the page draws.
//
// One turn, in order:
// 1. "Tell me more" continues the thread with the next answer Sam linked that hasn't been shown.
// 2. Typo repair: a word the model doesn't know and the bank never uses becomes the closest bank
//    word (one edit for a short word, two for a long one), but only if that improves the match.
//    "Sam" is read as "he" the same way, since most phrasings say "he".
// 3. Two questions in one message are split and answered in order, but only when each half
//    confidently matches a different answer.
// 4. A follow-up ("how long did that take?") is read against the last answer: it gets the sentence
//    of that answer that fits it best, or the linked answer it is really about.
// 5. Otherwise the message is matched on its own, as before. When nothing clears the bar but one
//    or two answers come close and share a telling word with it, the box asks "Did you mean".
//
// Pure: no DOM and no imports (the page passes bestMatch in, so a cached match.js can never break
// this module). Used by js/app.js, by the portfolio's ask bar, which loads it from the deployed site
// (so createConversation and the Turn shape are a public API; see README.md), and by the eval.

/**
 * @typedef {{ id: string, chat?: boolean, asks: string[], answer: string, points?: string[], detail?: string[], next?: string[], link: string | null }} Entry
 * @typedef {{ entry: Entry, score: number, matched: string, vector: Float32Array }} Ranked
 * @typedef {{ dim: number, pieces(t: string): { text: string, known: boolean }[], embed(t: string): Float32Array }} Embedder
 * @typedef {{ size: number, rank(q: string): Ranked[] }} Matcher
 * @typedef {{ type: 'pieces', text: string } | { type: 'vector', vector: Float32Array } | { type: 'ranked', rows: { text: string, score: number, best: boolean }[] }} View
 * @typedef {{ title: string, detail?: string, view?: View }} Step
 * @typedef {{ entry: Entry, aside: string | null, lines: string[] | null }} Part
 * @typedef {{
 *   kind: 'answer' | 'more' | 'followup' | 'two' | 'clarify' | 'none',
 *   query: string,
 *   fixes: { from: string, to: string }[],
 *   ranked: Ranked[],
 *   best: Ranked | null,
 *   steps: Step[],
 *   parts: Part[],
 *   message: string | null,
 *   suggest: Entry[],
 *   ms: number,
 * }} Turn
 */

// Tunables, set on the dev set only (eval/converse.mjs). The held-out set is scored once, at the end.
export const TUNING = {
  strong: 0.75, // a standalone match this strong is a new topic, even mid-thread
  followMin: 0.3, // a follow-up needs a line scoring at least this to be answered from the thread
  stay: 0.15, // the answer just shown is preferred over the answers it links to
  keep: 0.5, // ...but against a linked answer the question matches on its own, its line must reach this
  clarifyMin: 0.42, // under the bar but at least this close: "Did you mean"...
  clarifyDf: 3, // ...and only answers sharing a telling word with the question (one used by at most this many answers)
  soft: 0.6, // share of a line's score that comes from word-by-word alignment
  type: 0.12, // bonus for a line holding the kind of thing asked for (a time, a number, ...)
  num: 0.2, // bonus for a line containing a number the question names
  splitMin: 0.45, // each half of a two-part message must match at least this well
};

// Phrases that mean "keep going".
export const MORE = /^(?:tell me more|more|go on|keep going|continue|elaborate|what else|anything else|and then|say more)(?:\s+(?:about|on)\s+(?:it|that|this|them))?(?:,?\s*please)?\W*$/i;

const CLARIFY_LINE = 'Not sure I caught that. Did you mean:';
const MORE_ASIDE = "Here's more on that.";
const REPEAT_ASIDE = 'Like I said a moment ago:';
const FIRST_ASIDE = 'Two questions there. First:';
const SECOND_ASIDE = 'And second:';

// Signs a message leans on the last answer, strongest first: a word standing for it ("it", "they"),
// a bare "why?", a leading "and/so/what about", a pointing word ("that", "those": sometimes it
// names something new, as in "this site"), or just being short.
const IT = /\b(?:it|its|they|them|their|theirs)\b/i;
const BARE = /^(?:why|how|when|who|where|how so|like what|such as)\W*$/i;
const LEAD = /^(?:and|so|but|also|plus|what about|how about|ok(?:ay)?,? (?:and|so|but))\b/i;
const POINT = /\b(?:that|this|these|those)\b/i;

// "Sam", "Sam's", "Sam Bates", "Sam Bates's" (group 1 marks the possessive).
const NAME = /\bsam(?:\s+bates)?(['’]s|s(?=\s))?\b/gi;

// A two-part message: the second half has to open like a question of its own.
const OPENER = /^(?:what|what's|whats|where|where's|when|why|how|who|who's|which|whose|is|are|was|were|does|do|did|can|could|has|have|had|would|will|should|tell|any)\b/i;
const FILLER = /^(?:(?:and|also|but|so|plus|oh|ok(?:ay)?|then|&)[\s,]+)+/i;
// Where a message can break, most telling first. `both`: a bare comma also needs the first half to
// open like a question ("Can he code, where is he based?", not "Besides the copilot, what else?").
// Never "or": "is he remote or does he want an office" and "...in order, or can I jump around?"
// are one question each.
const JOINTS = [
  { re: /\?\s+(?=\S)/g }, { re: /;\s+/g }, { re: /\.\s+(?=[a-z])/gi }, { re: /,\s*(?:and|also|plus|but)\s+/gi },
  { re: /\s+(?:and|also|plus)\s+/gi }, { re: /,\s+/g, both: true },
];

// The kind of thing a question asks for, and how to spot a line that holds it.
const ASKS_FOR = [
  { kind: 'time', q: /\b(?:how long|how fast|how quick(?:ly)?|how soon|when|what year|which year|how much time|timeline)\b/i,
    line: /\b(?:\d+\s*(?:weeks?|days?|months?|years?|hours?|minutes?)|(?:19|20)\d\d|in (?:a|one) (?:day|week|month)|a day|overnight|(?:january|february|march|april|may|june|july|august|september|october|november|december))\b/i },
  { kind: 'count', q: /\b(?:how many|how much|how big|how large|what number|what size)\b/i,
    line: /\d|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|dozen|hundreds?|thousands?)\b/i },
  { kind: 'who', q: /^\s*who\b|\bwho (?:uses|built|runs|made|works|else)\b|\bwhich (?:team|teams|people)\b/i,
    line: /\b(?:team|teams|agents|people|builders|engineers|users|leaders|staff|coordinators|reports|colleagues|managers)\b/i },
  { kind: 'why', q: /^\s*why\b|\bwhat for\b|\bwhat's the point\b|\bpurpose\b|\breason\b/i,
    line: /\b(?:so|because|since|so that|in order to|instead of)\b/i },
  { kind: 'where', q: /^\s*where\b|\bwhich (?:city|state|country)\b|\btime ?zone\b/i,
    line: /\b(?:phoenix|arizona|tempe|remote|hybrid|office|utc)\b/i },
];

const STOP = new Set(('a an the and or but so if then than of to in on at by for from with about as into over under ' +
  'is are was were be been being am do does did done have has had having can could would will should may might must ' +
  'i me my you your we our he him his she her it its they them their this that these those there here ' +
  "what which who whom whose when where why how what's whats who's where's how's " +
  "sam sam's sams bates tell more please any some all just really very much many also too not no yes " +
  'like get got make made go going thing things stuff something anything kind sort lot lots').split(' '));

// Spellings people type without the apostrophe; never "repair" them.
const CONTRACTIONS = new Set(('whats hes shes thats theres wheres whos hows whys whens isnt arent wasnt werent doesnt dont ' +
  'didnt cant couldnt wont wouldnt shouldnt hasnt havent hadnt youre theyre ive youve weve theyve itll youll lets').split(' '));

/** @param {Float32Array} a @param {Float32Array} b */
function dot(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

/** Sentences of a paragraph: split after . ! ? when the next word starts a sentence. @param {string} text */
export function sentences(text) {
  /** @type {string[]} */
  const out = [];
  for (const s of text.split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/)) {
    const t = s.trim();
    if (!t) continue;
    // A fragment of one or two words belongs to the sentence before it.
    if (out.length && t.split(/\s+/).length < 3) out[out.length - 1] += ` ${t}`;
    else out.push(t);
  }
  return out;
}

/** Every line an entry can be quoted by: its lead's sentences, its highlights, its detail's sentences. @param {Entry} e */
export function linesOf(e) {
  return [...sentences(e.answer), ...(e.points ?? []), ...(e.detail ?? []).flatMap(sentences)];
}

/** Lowercase words, apostrophes kept. @param {string} text */
function wordsOf(text) {
  return (text.toLowerCase().match(/[a-z0-9]+(?:['’][a-z]+)?/g) ?? []).map((w) => w.replace('’', "'"));
}

/** Content words: no function words, pronouns or question words. @param {string} text */
function contentWords(text) {
  return wordsOf(text).filter((w) => !STOP.has(w) && (w.length >= 3 || /\d/.test(w)));
}

/**
 * Optimal string alignment distance (Levenshtein plus adjacent swaps), giving up past `max`.
 * @param {string} a @param {string} b @param {number} max
 */
export function osa(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= m; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= n; j++) {
      let v = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, d[i - 2][j - 2] + 1);
      d[i][j] = v;
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
  }
  return d[m][n];
}

/**
 * @param {{
 *   entries: Entry[], matcher: Matcher, embedder: Embedder, threshold: number, chatMin: number,
 *   bestMatch(ranked: Ranked[], threshold: number, chatMin: number): Ranked | null,
 *   fallbacks?: string[], starters?: Entry[], voice?: 'first' | 'third',
 *   tuning?: Partial<typeof TUNING>, random?: () => number,
 * }} opts `voice`: how the trace refers to the box ("I won't guess" on its own page, "it won't
 *   guess" in the portfolio's bar).
 */
export function createConversation({ entries, matcher, embedder, threshold, chatMin, bestMatch, fallbacks = [], starters = [], voice = 'first', tuning = {}, random = Math.random }) {
  const T = { ...TUNING, ...tuning };
  const byId = new Map(entries.map((e) => [e.id, e]));
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const wontGuess = voice === 'first' ? "so I won't guess" : "so it won't guess";
  const asksInstead = voice === 'first' ? "so I'll ask instead of guessing" : 'so it asks instead of guessing';

  // ---------- typo repair, against the bank's own words ----------
  /** @type {Map<string, number>} the bank's words, with how often each is used */
  const dict = new Map();
  /** @type {Set<string>} its contractions typed without the apostrophe ("wheres"): fine as typed, never a base for endings */
  const bare = new Set();
  for (const e of entries) {
    for (const text of [...e.asks, e.answer, ...(e.points ?? []), ...(e.detail ?? [])]) {
      for (const w of wordsOf(text)) {
        if (/^[a-z]+$/.test(w)) dict.set(w, (dict.get(w) ?? 0) + 1);
        else if (/^[a-z]+'[a-z]+$/.test(w)) bare.add(w.replace("'", ''));
      }
    }
  }
  const dictWords = [...dict.keys()].filter((w) => w.length >= 3);
  /** A word the model holds as one whole piece is a real word, even if the bank never uses it. @param {string} w */
  const wholePiece = (w) => {
    const p = embedder.pieces(w);
    return p.length === 1 && p[0].known && !p[0].text.startsWith('##');
  };
  /** @param {string} w */
  const real = (w) => w.length >= 3 && (dict.has(w) || wholePiece(w));
  /**
   * A real word: the bank uses it, the model holds it whole, or it's one of those plus an ending
   * ("coder", "escalation" when the bank says "escalations", "shipped", "coding").
   * @param {string} w lowercase
   */
  const known = (w) => {
    if (real(w) || CONTRACTIONS.has(w) || bare.has(w) || dict.has(`${w}s`) || dict.has(`${w}es`)) return true;
    for (const end of ['s', 'es', 'ed', 'd', 'ing', 'er', 'ers', 'ly']) {
      if (!w.endsWith(end)) continue;
      const stem = w.slice(0, -end.length);
      if (real(stem) || real(`${stem}e`) || (/(.)\1$/.test(stem) && real(stem.slice(0, -1)))) return true;
    }
    return false;
  };

  /** @param {string} q */
  function repair(q) {
    /** @type {{ from: string, to: string }[]} */
    const fixes = [];
    const fixed = q.replace(/[A-Za-z]+(?:['’][A-Za-z]+)?/g, (word) => {
      const w = word.toLowerCase();
      if (!/^[a-z]{4,}$/.test(w) || word === word.toUpperCase() || known(w)) return word;
      const max = w.length <= 6 ? 1 : 2;
      let pick = '';
      let pickD = max + 1;
      let pickN = 0;
      for (const d of dictWords) {
        if (Math.abs(d.length - w.length) > 2) continue;
        const dist = osa(w, d, max);
        if (dist > max) continue;
        const n = dict.get(d) ?? 0;
        // Closest first; on a tie, the word the bank uses most; then alphabetical, so it's stable.
        if (dist < pickD || (dist === pickD && (n > pickN || (n === pickN && d < pick)))) {
          pick = d;
          pickD = dist;
          pickN = n;
        }
      }
      if (!pick) return word;
      fixes.push({ from: word, to: pick });
      return word[0] === word[0].toUpperCase() ? pick[0].toUpperCase() + pick.slice(1) : pick;
    });
    return { fixed, fixes };
  }

  // ---------- "did you mean": only answers that share a telling word with the question ----------
  /** @param {string} w */
  const stemOf = (w) => w.replace(/(?:ing|ed|es|s)$/, '');
  // The answer's own text, not its phrasings: phrasings carry generic asking words ("tour", "best").
  /** @type {Map<Entry, Set<string>>} */
  const stems = new Map(entries.map((e) => [e, new Set(contentWords([e.answer, ...(e.points ?? []), ...(e.detail ?? [])].join(' ')).map(stemOf))]));
  /** @type {Map<string, number>} how many answers use each stem */
  const stemDf = new Map();
  for (const set of stems.values()) for (const s of set) stemDf.set(s, (stemDf.get(s) ?? 0) + 1);
  /** @param {string} q @param {Entry} e */
  const sharesWord = (q, e) => contentWords(q).map(stemOf).some((s) => stems.get(e)?.has(s) && (stemDf.get(s) ?? 0) <= T.clarifyDf);

  // ---------- lines: answering a follow-up with the sentence that answers it ----------
  /** @type {Map<string, Float32Array>} */
  const wordVecs = new Map();
  /** @param {string} w */
  const vecOf = (w) => {
    let v = wordVecs.get(w);
    if (!v) wordVecs.set(w, (v = embedder.embed(w)));
    return v;
  };
  /** @typedef {{ text: string, vec: Float32Array, wvecs: Float32Array[], nums: Set<string>, kinds: Set<string> }} Line */
  /** @type {Map<string, Line[]>} */
  const lineCache = new Map();
  /** @param {Entry} e */
  const linesFor = (e) => {
    let ls = lineCache.get(e.id);
    if (!ls) {
      ls = linesOf(e).map((text) => ({
        text,
        vec: embedder.embed(text),
        wvecs: contentWords(text).map(vecOf),
        nums: new Set(text.match(/\d+/g) ?? []),
        kinds: new Set(ASKS_FOR.filter((k) => k.line.test(text)).map((k) => k.kind)),
      }));
      lineCache.set(e.id, ls);
    }
    return ls;
  };

  /**
   * The best line for a question among some answers. A line's `fit` is its similarity to the
   * question, blended with how well each of the question's words lines up with one of its words,
   * plus a bonus when it holds the kind of thing asked for. Its `score` adds the `stay` preference
   * for the first answer (the one just shown), which also lowers the bar its lines must clear.
   * @param {string} q @param {Entry[]} cands @param {boolean} [stay] prefer cands[0] (default true)
   */
  function bestLine(q, cands, stay = true) {
    const qv = embedder.embed(q);
    const qw = contentWords(q).map(vecOf).filter((v) => v.some((x) => x !== 0));
    const kind = ASKS_FOR.find((k) => k.q.test(q))?.kind ?? null;
    const qNums = q.match(/\d+/g) ?? [];
    /** @type {{ entry: Entry, text: string, score: number, fit: number } | null} */
    let top = null;
    for (const e of cands) {
      for (const line of linesFor(e)) {
        let soft = 0;
        for (const v of qw) {
          let m = 0;
          for (const lv of line.wvecs) m = Math.max(m, dot(v, lv));
          soft += m;
        }
        let fit = qw.length ? (1 - T.soft) * dot(qv, line.vec) + T.soft * (soft / qw.length) : dot(qv, line.vec);
        if (kind && line.kinds.has(kind)) fit += T.type;
        if (qNums.some((x) => line.nums.has(x))) fit += T.num;
        const score = fit + (stay && e === cands[0] ? T.stay : 0);
        if (!top || score > top.score) top = { entry: e, text: line.text, score, fit };
      }
    }
    return top;
  }

  // ---------- one question ----------
  /**
   * Does this "it" stand for something named earlier in the same message, not for the last answer?
   * "the POS partner shut down its API", "this box, does it send...", "does phoenix move its clocks".
   * @param {string} q @param {RegExpExecArray} it
   */
  function named(q, it) {
    const before = q.slice(0, it.index);
    if (/\b(?:the|a|an|this|that|these|those)\s+\w+/i.test(before)) return true;
    return /^(?:its|their|theirs)$/i.test(it[0]) && contentWords(before).length > 0;
  }

  /** @param {string} q */
  function cueOf(q) {
    const it = IT.exec(q);
    if (it && !named(q, it)) return 'it';
    if (BARE.test(q)) return 'bare';
    // "and the AI side?" leans on the last answer; "and what are his pay expectations?" is a new
    // question that happens to start with "and".
    const lead = LEAD.exec(q);
    if (lead) return OPENER.test(q.slice(lead[0].length).replace(/^[\s,]+/, '')) ? 'ask' : 'lead';
    if (POINT.test(q)) return 'point';
    if (q.split(/\s+/).length <= 5) return 'short';
    return null;
  }

  /**
   * One question (a whole message, or half of one), read against the thread when it leans on it.
   * how: 'answer' = a whole answer matched on its own; 'line' = one sentence of the thread's answer;
   * 'linked' = an answer the thread links to; 'found' = an answer outside the thread whose own
   * sentence fits best (shown whole, not as a follow-up); 'none' = nothing confident.
   * @param {string} q @param {Entry | null} ctx the answer the thread is on
   */
  function resolve(q, ctx) {
    const ranked = matcher.rank(q);
    const best = bestMatch(ranked, threshold, chatMin);
    const cue = ctx ? cueOf(q) : null;
    /** @typedef {{ how: 'answer' | 'line' | 'linked' | 'found' | 'none', entry: Entry | null, line: string | null, score: number, ranked: Ranked[], best: Ranked | null }} Resolved */
    /** @type {Resolved} */
    const out = { how: 'none', entry: null, line: null, score: best ? best.score : ranked[0]?.score ?? 0, ranked, best };
    const standalone = () => (best ? { ...out, how: /** @type {const} */ ('answer'), entry: best.entry } : out);
    if (!ctx || !cue || best?.entry.chat) return standalone();
    const linked = /** @type {Entry[]} */ ((ctx.next ?? []).map((id) => byId.get(id)).filter((e) => e && !e.chat));
    /** @param {{ entry: Entry, text: string, fit: number }} l @returns {Resolved} */
    const fromLine = (l) => ({
      ...out,
      how: l.entry === ctx ? 'line' : linked.includes(l.entry) ? 'linked' : 'found',
      entry: l.entry,
      line: l.text,
      score: l.score,
    });

    // Asked about the answer just shown, again. The same question again gets all of it ("Like I
    // said"); another side of it ("what time zone?" after "where is he based?") gets the line.
    if (best && best.entry === ctx) {
      const l = best.matched !== threadMatched ? bestLine(q, [ctx]) : null;
      return l && l.score >= T.followMin ? fromLine(l) : { ...out, how: 'answer', entry: ctx };
    }
    // It names, strongly, an answer the thread links to ("what's the starship thing it mentions?").
    if (best && linked.includes(best.entry) && best.score >= T.strong) return { ...out, how: 'linked', entry: best.entry };
    // "it", a bare "why?" or a leading "and": about the answer just shown, if a line of it fits.
    // When the question also matches a linked answer on its own ("does it use RAG?" after the
    // copilot), the line has to fit well to win.
    if (cue === 'it' || cue === 'bare' || cue === 'lead') {
      const l = bestLine(q, [ctx]);
      if (l && l.score >= (best && linked.includes(best.entry) ? T.keep : T.followMin)) return fromLine(l);
    }
    // A pointing word ("certified for that?") lets every candidate's lines compete instead.
    if (best && linked.includes(best.entry) && cue !== 'point') return { ...out, how: 'linked', entry: best.entry };
    // A strong match elsewhere is a new topic; so is a short question, or a full one after "and",
    // that matches on its own.
    if (best && !linked.includes(best.entry) && (best.score >= T.strong || cue === 'short' || cue === 'ask')) return standalone();
    // Otherwise the best line among the thread's answers and the closest answers overall.
    const near = ranked.slice(0, 2).map((r) => r.entry).filter((e) => !e.chat && e !== ctx && !linked.includes(e));
    const l = bestLine(q, [ctx, ...linked, ...near]);
    return l && l.score >= T.followMin ? fromLine(l) : standalone();
  }

  // ---------- the conversation ----------
  /** @type {Set<string>} answers shown in full */
  const answered = new Set();
  /** @type {Entry | null} the answer the thread is on (never small talk) */
  let thread = null;
  /** The visitor's words that led to it, quoted in the trace. */
  let threadAsk = '';
  /** @type {string | null} the phrasing it matched, to tell a repeated question from a new side of it */
  let threadMatched = null;
  /** @param {Entry} e @param {string} ask @param {string | null} matched */
  const follow = (e, ask, matched) => {
    thread = e;
    threadAsk = ask;
    threadMatched = matched;
  };

  /** Chips after an answer: the ones Sam linked, then theirs, then the closest matches. @param {Entry} e @param {Ranked[]} ranked */
  function chipsAfter(e, ranked) {
    /** @type {Entry[]} */
    const out = [];
    const add = (/** @type {Entry | undefined} */ x) => {
      if (x && !x.chat && x !== e && !answered.has(x.id) && !out.includes(x) && out.length < 2) out.push(x);
    };
    for (const id of e.next ?? []) add(byId.get(id));
    for (const id of e.next ?? []) for (const id2 of byId.get(id)?.next ?? []) add(byId.get(id2));
    for (const r of ranked) add(r.entry);
    return out;
  }

  /** @param {Ranked[]} ranked @param {Ranked | null} best @returns {View} */
  const rankedView = (ranked, best) => ({ type: 'ranked', rows: ranked.slice(0, 3).map((r) => ({ text: r.matched, score: r.score, best: r === best })) });
  /** The four steps of a plain search. @param {string} q @param {Ranked[]} ranked @param {Ranked | null} best @returns {Step[]} */
  const searchSteps = (q, ranked, best) => [
    { title: 'Read your question', view: { type: 'pieces', text: q } },
    { title: `Turned it into ${embedder.dim} numbers`, view: { type: 'vector', vector: ranked[0].vector } },
    { title: `Compared it with ${matcher.size} phrasings`, detail: `${entries.length} answers · cosine similarity` },
    { title: 'Ranked the closest answers', view: rankedView(ranked, best) },
  ];
  /** @param {Ranked} r */
  const barFor = (r) => (r.entry.chat ? chatMin : threshold);
  /** Rounded down, so a score just under the bar never shows as the bar. @param {number} x */
  const fmt = (x) => (Math.floor(x * 100) / 100).toFixed(2);
  /** @param {string} s */
  const quote = (s) => `“${s.length > 72 ? `${s.slice(0, 70).trimEnd()}…` : s}”`;

  /** The part to show for a resolved question; marks a whole answer as shown. @param {ReturnType<typeof resolve>} r @param {string | null} aside @returns {Part} */
  function partFor(r, aside) {
    const e = /** @type {Entry} */ (r.entry);
    if (r.how === 'line') return { entry: e, aside, lines: [/** @type {string} */ (r.line)] };
    const seen = answered.has(e.id);
    answered.add(e.id);
    if (r.how === 'linked') return seen && r.line ? { entry: e, aside: aside ?? MORE_ASIDE, lines: [r.line] } : { entry: e, aside: aside ?? MORE_ASIDE, lines: null };
    return { entry: e, aside: aside ?? (seen && !e.chat ? REPEAT_ASIDE : null), lines: null };
  }

  /**
   * Two questions in one message, or null. Each half opens like a question, has two or more words,
   * and confidently matches a different real answer.
   * @param {string} q
   */
  function splitTwo(q) {
    for (const { re, both } of JOINTS) {
      re.lastIndex = 0;
      for (let m = re.exec(q); m; m = re.exec(q)) {
        const a = q.slice(0, m.index + (m[0].startsWith('?') ? 1 : 0)).trim();
        const b = q.slice(m.index + m[0].length).replace(FILLER, '').trim();
        if (a.split(/\s+/).length < 2 || b.split(/\s+/).length < 2 || !OPENER.test(b) || (both && !OPENER.test(a))) continue;
        const rA = resolve(a, thread);
        if (!rA.entry || rA.entry.chat || rA.how === 'found' || rA.score < T.splitMin) continue;
        const rB = resolve(b, rA.entry);
        if (!rB.entry || rB.entry.chat || rB.how === 'found' || rB.entry === rA.entry || (rB.how === 'answer' && rB.score < T.splitMin)) continue;
        return { a, b, rA, rB };
      }
    }
    return null;
  }

  /**
   * Answer one message.
   * @param {string} raw
   * @returns {Turn}
   */
  function turn(raw) {
    const t0 = now();
    const q = raw.trim();
    /** @type {Step[]} */
    const steps = [];
    /** @param {Omit<Turn, 'ms' | 'steps'>} t @returns {Turn} */
    const done = (t) => ({ ...t, steps, ms: now() - t0 });

    // 1. "Tell me more": the next answer down the thread that hasn't been shown yet.
    if (thread && MORE.test(q)) {
      const from = thread;
      const down = [...(from.next ?? []), ...(from.next ?? []).flatMap((id) => byId.get(id)?.next ?? [])];
      const next = byId.get(down.find((id) => id !== from.id && !answered.has(id)) ?? from.next?.[0] ?? '');
      if (next) {
        const ranked = matcher.rank(next.asks[0]);
        steps.push({ title: 'Picked up the thread', detail: `continuing from ${quote(threadAsk)}` });
        steps.push({ title: 'Found the next part of the story', detail: quote(next.asks[0]) });
        answered.add(next.id);
        follow(next, next.asks[0], null);
        return done({ kind: 'more', query: q, fixes: [], ranked, best: ranked.find((r) => r.entry === next) ?? null, parts: [{ entry: next, aside: MORE_ASIDE, lines: null }], message: null, suggest: chipsAfter(next, ranked) });
      }
    }

    // 2. Typo repair. A repair has to help: if it makes the best match worse, the original words stand.
    let { fixed: query, fixes } = repair(q);
    if (fixes.length && (matcher.rank(query)[0]?.score ?? 0) < (matcher.rank(q)[0]?.score ?? 0)) {
      query = q;
      fixes = [];
    }
    if (fixes.length) steps.push({ title: fixes.length > 1 ? `Fixed ${fixes.length} typos` : 'Fixed a typo', detail: fixes.map((f) => `${f.from} → ${f.to}`).join(', ') });

    // Most phrasings say "he", so a question that says "Sam" leans toward the few that say "Sam"
    // ("Is this Sam?"). Read it as "he" too, and keep whichever reading matches better.
    const plain = query.replace(NAME, (m, poss, offset, s) => (poss ? 'his' : /\b(?:about|for|with|to|of|from|on|at|by|hire|hiring|contact|email|ask|reach|meet|know)\s*$/i.test(s.slice(0, offset)) ? 'him' : 'he'));
    if (plain !== query) {
      if ((matcher.rank(plain)[0]?.score ?? 0) > (matcher.rank(query)[0]?.score ?? 0)) {
        steps.push({ title: 'Read “Sam” as “he”', detail: quote(plain) });
        query = plain;
      }
    }

    // 3. Two questions in one message.
    const two = splitTwo(query);
    if (two) {
      const { a, b, rA, rB } = two;
      const eA = /** @type {Entry} */ (rA.entry);
      const eB = /** @type {Entry} */ (rB.entry);
      steps.push({ title: 'Split it into two questions', detail: `${quote(a)} · ${quote(b)}` });
      steps.push({ title: 'Read your question', view: { type: 'pieces', text: query } });
      steps.push({ title: 'Ranked answers for the first', view: rankedView(rA.ranked, rA.ranked.find((r) => r.entry === eA) ?? null) });
      steps.push(rB.how === 'answer'
        ? { title: 'Ranked answers for the second', view: rankedView(rB.ranked, rB.ranked.find((r) => r.entry === eB) ?? null) }
        : { title: 'Read the second as a follow-up to the first', detail: quote(rB.line ?? eB.asks[0]) });
      steps.push({ title: 'Confident in both', detail: `${fmt(rA.score)} and ${fmt(rB.score)} both clear the bar` });
      const parts = [partFor(rA, FIRST_ASIDE), partFor(rB, SECOND_ASIDE)];
      follow(eB, b, rB.how === 'answer' ? rB.best?.matched ?? null : null);
      return done({ kind: 'two', query, fixes, ranked: rA.ranked, best: rA.best, parts, message: null, suggest: chipsAfter(eB, rB.ranked) });
    }

    // 4 and 5. One question: read against the thread when it leans on it, or on its own.
    const from = thread;
    const r = resolve(query, from);
    steps.push(...searchSteps(query, r.ranked, r.how === 'answer' ? r.best : null));
    if (r.entry && from && (r.how === 'line' || r.how === 'linked')) {
      steps.push({ title: 'Read it as a follow-up', detail: `to ${quote(threadAsk)}` });
      steps.push(r.how === 'line'
        ? { title: 'Picked the line that fits best', detail: quote(/** @type {string} */ (r.line)) }
        : { title: 'Followed the thread', detail: `to ${quote(r.entry.asks[0])}` });
      const part = partFor(r, null);
      follow(r.entry, q, null);
      return done({ kind: 'followup', query, fixes, ranked: r.ranked, best: r.best, parts: [part], message: null, suggest: chipsAfter(r.entry, r.ranked) });
    }
    if (r.entry && r.how === 'found') {
      // Not a follow-up after all: an answer outside the thread, found by one of its own sentences.
      steps.push({ title: 'Checked the closest answers’ own sentences', detail: `${quote(/** @type {string} */ (r.line))} fits best` });
      const part = partFor(r, null);
      follow(r.entry, q, null);
      return done({ kind: 'answer', query, fixes, ranked: r.ranked, best: r.best, parts: [part], message: null, suggest: chipsAfter(r.entry, r.ranked) });
    }
    if (r.entry && r.best) {
      const best = r.best;
      steps.push({ title: 'Confident in the best match', detail: `${fmt(best.score)} clears the ${barFor(best)} bar${best.entry.chat ? ' for small talk' : ''}` });
      const part = partFor(r, null);
      if (!r.entry.chat) follow(r.entry, q, best.matched);
      return done({ kind: 'answer', query, fixes, ranked: r.ranked, best, parts: [part], message: null, suggest: chipsAfter(r.entry, r.ranked) });
    }
    const top = r.ranked[0];
    const close = r.ranked.filter((x) => !x.entry.chat).slice(0, 2).map((x) => x.entry).filter((e) => sharesWord(query, e));
    if (top && top.score >= T.clarifyMin && close.length) {
      steps.push({ title: 'Not confident enough to answer', detail: `${fmt(top.score)} is under the ${barFor(top)} bar, ${asksInstead}` });
      return done({ kind: 'clarify', query, fixes, ranked: r.ranked, best: null, parts: [], message: CLARIFY_LINE, suggest: close });
    }
    steps.push({ title: 'Not confident enough to answer', detail: `${fmt(top?.score ?? 0)} is under the ${top ? barFor(top) : threshold} bar, ${wontGuess}` });
    const message = fallbacks.length ? fallbacks[Math.floor(random() * fallbacks.length)] : null;
    return done({ kind: 'none', query, fixes, ranked: r.ranked, best: null, parts: [], message, suggest: starters });
  }

  return {
    turn,
    /** Start over: forget the thread and what has been shown. */
    reset() {
      answered.clear();
      thread = null;
      threadAsk = '';
      threadMatched = null;
    },
    /** The answer the thread is on. */
    get thread() {
      return thread;
    },
    /**
     * For the eval: how a message would be read right now, without taking the turn.
     * @param {string} q
     */
    peek(q) {
      const ranked = matcher.rank(q);
      const ctx = thread;
      const linked = ctx ? /** @type {Entry[]} */ ((ctx.next ?? []).map((id) => byId.get(id)).filter(Boolean)) : [];
      const others = ranked.slice(0, 3).map((r) => r.entry).filter((e) => !e.chat && e !== ctx && !linked.includes(e));
      return {
        cue: ctx ? cueOf(q) : null,
        ctx: ctx?.id ?? null,
        ranked: ranked.slice(0, 3).map((r) => `${r.entry.id} ${r.score.toFixed(2)}${ctx && (r.entry === ctx || linked.includes(r.entry)) ? '*' : ''}`),
        lines: [...(ctx ? [ctx] : []), ...linked, ...others].map((e) => {
          const l = bestLine(q, [e], false);
          return `${e === ctx ? 'CTX ' : linked.includes(e) ? 'LNK ' : 'TOP '}${e.id} ${l ? l.score.toFixed(2) : '-'} "${l ? l.text.slice(0, 60) : ''}"`;
        }),
      };
    },
  };
}
