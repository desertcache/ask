// Scoring for the conversation layer (js/converse.js), shared by eval/converse.mjs and the tests.
//
// A conversation set (eval/questions-converse.json) has five lists:
// - followups: two turns; turn 2 is read in the context of turn 1. "same" wants one line of turn 1's
//   answer (its `says` phrase must be in what's shown), "related" a different answer, "switch" a
//   new topic, "none" a decline.
// - twoPart: one message asking two things; both answers must be shown.
// - andSingles: one question that only looks like two; it must not be split.
// - typos: misspelled questions; the right answer must be shown.
// - offTopic: must be declined (a "Did you mean" counts as declining; `near` ones may get chips).
// The older single-question sets (inScope/offTopic) are scored "through the brain" by scoreSingles:
// each question opens a fresh conversation, so typo repair and splitting can't quietly cost them.

/** @typedef {import('../js/converse.js').Turn} Turn */

const norm = (/** @type {string} */ s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const declined = (/** @type {Turn} */ t) => t.kind === 'none' || t.kind === 'clarify';

/** Everything the visitor reads in a turn's answer. @param {Turn} t */
export function shownText(t) {
  return t.parts.map((p) => (p.lines ? p.lines.join(' ') : [p.entry.answer, ...(p.entry.detail ?? []), ...(p.entry.points ?? [])].join(' '))).join(' ');
}

/** As in eval/score.js: a decline is right where "none" is expected, an answer where its id is. @param {Turn} t @param {string[]} expect */
function hit(t, expect) {
  return declined(t) ? expect.includes('none') : expect.includes(t.parts[0].entry.id);
}

/**
 * @param {() => { turn(q: string): Turn }} fresh a new conversation
 * @param {any} set
 */
export function scoreConverse(fresh, set) {
  const rows = [];
  const f = { n: 0, t1: 0, t2: 0, t2GivenT1: 0, nT1: 0, byType: /** @type {Record<string, { n: number, right: number, focused: number }>} */ ({}) };
  for (const c of set.followups ?? []) {
    const convo = fresh();
    const [a, b] = c.turns;
    const t1 = convo.turn(a.q);
    const t2 = convo.turn(b.q);
    const ok1 = hit(t1, a.expect);
    const says = !b.says || norm(shownText(t2)).includes(norm(b.says));
    const ok2 = hit(t2, b.expect) && says;
    const focused = ok2 && !declined(t2) && t2.parts[0].lines !== null;
    const bt = (f.byType[c.type] ??= { n: 0, right: 0, focused: 0 });
    bt.n++;
    if (ok2) bt.right++;
    if (focused) bt.focused++;
    f.n++;
    if (ok1) { f.t1++; f.nT1++; if (ok2) f.t2GivenT1++; }
    if (ok2) f.t2++;
    rows.push({ list: 'followup', type: c.type, ok: ok2, q: `${a.q} >> ${b.q}`, got: describe(t2), want: `${b.expect.join('|')}${b.says ? ` "${b.says}"` : ''}`, note: ok1 ? '' : `turn 1 -> ${describe(t1)}` });
  }
  const two = { n: 0, both: 0, one: 0 };
  for (const x of set.twoPart ?? []) {
    const t = fresh().turn(x.q);
    const ids = declined(t) ? [] : t.parts.map((p) => p.entry.id);
    const both = t.kind === 'two' && x.expect[0].includes(ids[0]) && x.expect[1].includes(ids[1]);
    const one = !both && ids.some((id) => x.expect[0].includes(id) || x.expect[1].includes(id));
    two.n++;
    if (both) two.both++;
    if (one) two.one++;
    rows.push({ list: 'twoPart', ok: both, q: x.q, got: describe(t), want: x.expect.map((e) => e.join('|')).join(' + ') });
  }
  const singles = { n: 0, right: 0, split: 0 };
  for (const x of set.andSingles ?? []) {
    const t = fresh().turn(x.q);
    const ok = t.kind !== 'two' && hit(t, x.expect);
    singles.n++;
    if (ok) singles.right++;
    if (t.kind === 'two') singles.split++;
    rows.push({ list: 'andSingle', ok, q: x.q, got: describe(t), want: x.expect.join('|') });
  }
  const typos = { n: 0, right: 0, fixed: 0 };
  for (const x of set.typos ?? []) {
    const t = fresh().turn(x.q);
    const ok = hit(t, x.expect);
    typos.n++;
    if (ok) typos.right++;
    if (t.fixes.length) typos.fixed++;
    rows.push({ list: 'typo', ok, q: x.q, got: describe(t), want: x.expect.join('|') });
  }
  const off = { n: 0, declined: 0, chips: 0, farChips: 0 };
  for (const x of set.offTopic ?? []) {
    const t = fresh().turn(x.q);
    const ok = declined(t);
    off.n++;
    if (ok) off.declined++;
    if (t.kind === 'clarify') { off.chips++; if (!x.near) off.farChips++; }
    rows.push({ list: 'offTopic', ok, q: x.q, got: describe(t), want: 'none' });
  }
  return { followups: f, twoPart: two, andSingles: singles, typos, offTopic: off, rows };
}

/**
 * The older single-question sets, scored through the conversation. right = the answer shown first
 * is expected; right3 = it or one of the top three matches is; rejected = off-topic declined.
 * @param {() => { turn(q: string): Turn }} fresh
 * @param {{ inScope: { q: string, expect: string[] }[], offTopic: string[] }} set
 */
export function scoreSingles(fresh, { inScope, offTopic }) {
  let right = 0;
  let right3 = 0;
  let rejected = 0;
  let split = 0;
  let fixed = 0;
  let clarifyHit = 0;
  let clarifyIn = 0;
  let clarifyOff = 0;
  const misses = [];
  for (const { q, expect } of inScope) {
    const t = fresh().turn(q);
    const ok = hit(t, expect);
    const top3 = t.ranked.slice(0, 3).map((r) => r.entry.id);
    if (ok) right++;
    // As in eval/score.js: a decline counts only where declining is right.
    if (declined(t) ? expect.includes('none') : [t.parts[0].entry.id, ...top3].some((id) => expect.includes(id))) right3++;
    if (t.kind === 'two') split++;
    if (t.fixes.length) fixed++;
    if (t.kind === 'clarify') clarifyIn++;
    if (t.kind === 'clarify' && t.suggest.some((e) => expect.includes(e.id))) clarifyHit++;
    if (!ok) misses.push(`MISS  ${q.slice(0, 60).padEnd(60)} -> ${describe(t)}  want ${expect.join('|')}`);
  }
  for (const q of offTopic) {
    const t = fresh().turn(q);
    if (declined(t)) rejected++;
    else misses.push(`LEAK  ${q.slice(0, 60).padEnd(60)} -> ${describe(t)}`);
    if (t.kind === 'two') split++;
    if (t.kind === 'clarify') { clarifyOff++; misses.push(`CHIPS ${q.slice(0, 60).padEnd(60)} -> ${describe(t)}`); }
  }
  return { right, right3, rejected, split, fixed, clarifyIn, clarifyHit, clarifyOff, of: `${inScope.length}/${offTopic.length}`, misses };
}

/**
 * The box before the conversation layer, in the Turn shape, for a baseline on the same sets:
 * every message matched on its own, and "tell me more" continues through the first linked answer.
 * @param {{ entries: any[], matcher: any, threshold: number, chatMin: number, bestMatch: Function }} o
 * @returns {{ turn(q: string): Turn }}
 */
export function legacyConversation({ entries, matcher, threshold, chatMin, bestMatch }) {
  const byId = new Map(entries.map((e) => [e.id, e]));
  const MORE = /^(?:tell me more|more|go on|keep going|continue|elaborate|what else|anything else|and then|say more)\W*$/i;
  let last = null;
  return {
    turn(q) {
      const follow = MORE.test(q.trim()) && last?.next?.length ? byId.get(last.next[0]) : null;
      const ranked = matcher.rank(follow ? follow.asks[0] : q);
      const best = follow ? ranked.find((r) => r.entry === follow) ?? null : bestMatch(ranked, threshold, chatMin);
      if (best) last = best.entry;
      return { kind: best ? (follow ? 'more' : 'answer') : 'none', query: q, fixes: [], ranked, best, steps: [], parts: best ? [{ entry: best.entry, aside: null, lines: null }] : [], message: null, suggest: [], ms: 0 };
    },
  };
}

/** @param {Turn} t */
export function describe(t) {
  const fx = t.fixes.length ? ` [fixed ${t.fixes.map((x) => `${x.from}>${x.to}`).join(',')}]` : '';
  if (t.kind === 'none') return `(declined)${fx}`;
  if (t.kind === 'clarify') return `(did you mean ${t.suggest.map((e) => e.id).join(', ')})${fx}`;
  return t.parts.map((p) => `${t.kind}:${p.entry.id}${p.lines ? ` "${p.lines[0].slice(0, 50)}"` : ''}`).join(' + ') + fx;
}
