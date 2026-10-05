// The chat UI. Every answer comes from data/bank.json (built from the reviewed qa.md); nothing is
// generated. The trace under each question shows what the model really did (its word pieces, its
// vector, the comparison, the ranked matches and the confidence check), paced so a person can
// follow it (~3 s); the summary line reports the real compute time. Text goes in via textContent,
// never innerHTML.

import { createEmbedder } from './embed.js';
import { createMatcher } from './match.js';
import { MODEL, MODEL_MB, THRESHOLD, MATCH_OPTIONS, PORTFOLIO, STARTERS } from './config.js';

/** @typedef {{ id: string, asks: string[], answer: string, points?: string[], detail?: string[], next?: string[], link: string | null }} Entry */

const $ = (sel) => /** @type {HTMLElement} */ (document.querySelector(sel));
const log = $('#log');
const form = /** @type {HTMLFormElement} */ ($('#ask'));
const input = /** @type {HTMLInputElement} */ ($('#q'));
const send = /** @type {HTMLButtonElement} */ ($('#send'));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const STEP_MS = 620;
const WORD_MS = 22;

if (new URLSearchParams(location.search).has('embed')) document.body.classList.add('is-embed');

const wait = (ms) => new Promise((r) => setTimeout(r, reduced ? 0 : ms));

/** @param {string} tag @param {string} [cls] @param {string} [text] */
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function scrollDown() {
  log.scrollTo({ top: log.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
}

/** A bot message row: avatar + bubble. Returns the bubble. */
function botRow() {
  const row = el('div', 'msg bot');
  row.append(el('span', 'avatar'));
  const bubble = el('div', 'bubble');
  row.append(bubble);
  log.append(row);
  return bubble;
}

/** @param {string} text */
function userRow(text) {
  const row = el('div', 'msg me');
  row.append(el('div', 'bubble', text));
  log.append(row);
}

/**
 * The answer: its lead, then either prose paragraphs (detail) or a list (points), whichever shape
 * the bank gives it. Most answers are prose; lists are only for content that is a list.
 * @param {string} lead @param {string[]} [points] @param {string[]} [detail]
 */
function answerBlock(lead, points = [], detail = []) {
  const box = el('div', 'answer-block');
  const p = el('p', 'answer');
  let i = words(p, lead, 0);
  box.append(p);
  for (const para of detail) {
    const more = el('p', 'answer');
    i = words(more, para, i);
    box.append(more);
  }
  if (points.length) {
    const ul = el('ul', 'points');
    for (const pt of points) {
      const li = el('li');
      i = words(li, pt, i);
      ul.append(li);
    }
    box.append(ul);
  }
  return { box, words: i };
}

/**
 * Text as words for the CSS stagger (each word takes the next --i), with any email address as a
 * mailto link. Returns the next free index.
 * @param {HTMLElement} p @param {string} text @param {number} i
 */
function words(p, text, i) {
  for (const [k, part] of text.split(/([\w.+-]+@[\w-]+\.[\w.]+)/).entries()) {
    if (k % 2) {
      const a = /** @type {HTMLAnchorElement} */ (el('a', 'w', part));
      a.href = `mailto:${part}`;
      a.style.setProperty('--i', String(i++));
      p.append(a);
      continue;
    }
    for (const word of part.split(/(\s+)/)) {
      if (!word) continue;
      if (/^\s+$/.test(word)) { p.append(word); continue; }
      const s = el('span', 'w', word);
      s.style.setProperty('--i', String(i++));
      p.append(s);
    }
  }
  return i;
}

/** @param {string} link */
function moreLink(link) {
  const external = /^https?:/.test(link) && !link.startsWith(PORTFOLIO);
  const a = /** @type {HTMLAnchorElement} */ (el('a', 'more', external ? 'Open ' : 'Read more on the site '));
  a.href = new URL(link, PORTFOLIO).href;
  a.target = external ? '_blank' : '_top';
  if (external) a.rel = 'noopener';
  const arrow = el('span', '', external ? '↗' : '→');
  arrow.setAttribute('aria-hidden', 'true');
  a.append(arrow);
  return a;
}

/** @param {Entry[]} entries @param {(q: string) => void} ask */
function chipRow(entries, ask) {
  const row = el('div', 'chips');
  for (const e of entries) {
    const b = /** @type {HTMLButtonElement} */ (el('button', 'chip', e.asks[0]));
    b.type = 'button';
    b.addEventListener('click', () => ask(e.asks[0]));
    row.append(b);
  }
  return row;
}

/** The query vector as a strip of bars, one per dimension. @param {Float32Array} v */
function vectorStrip(v) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  // Scale to ~2.5x the RMS, not the max: one large dimension would otherwise flatten the rest.
  const rms = Math.sqrt(v.reduce((s, x) => s + x * x, 0) / v.length) || 1;
  const max = rms * 2.5;
  svg.setAttribute('viewBox', `0 0 ${v.length * 2} 24`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('class', 'vec');
  svg.setAttribute('aria-hidden', 'true');
  v.forEach((x, i) => {
    const h = Math.max(0.6, Math.min(1, Math.abs(x) / max) * 11);
    const r = document.createElementNS(ns, 'rect');
    r.setAttribute('x', String(i * 2));
    r.setAttribute('width', '1.4');
    r.setAttribute('y', String(x >= 0 ? 12 - h : 12));
    r.setAttribute('height', String(h));
    r.setAttribute('class', x >= 0 ? 'pos' : 'neg');
    svg.append(r);
  });
  return svg;
}

/** One trace step: spinner while running, tick when done. @param {HTMLElement} list @param {string} title */
function step(list, title) {
  const li = el('li', 'step is-running');
  li.append(el('span', 'tick'), el('span', 'step-title', title));
  list.append(li);
  scrollDown();
  return {
    li,
    /** @param {Node} [detail] */
    done(detail) {
      if (detail) li.append(detail);
      li.classList.replace('is-running', 'is-done');
    },
  };
}

async function main() {
  const bank = await (await fetch('data/bank.json')).json();
  /** @type {Entry[]} */
  const entries = bank.entries;
  const byId = new Map(entries.map((e) => [e.id, e]));
  const starters = /** @type {Entry[]} */ (STARTERS.map((id) => byId.get(id)).filter(Boolean));

  // Greeting, with the load progress until the model is ready.
  const hello = botRow();
  hello.append(el('p', 'answer', `Hi! I'm a ${MODEL_MB} MB model running right here in your browser. Ask me anything about Sam's work, his AI projects or his background.`));
  const loading = el('p', 'loading', 'Loading the model…');
  hello.append(loading);
  setBusy(true);

  const res = await fetch(`models/${MODEL}.bin`);
  if (!res.ok || !res.body) throw new Error(`model: ${res.status}`);
  const total = Number(res.headers.get('Content-Length')) || 0;
  const reader = res.body.getReader();
  const parts = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    got += value.length;
    loading.textContent = total
      ? `Loading the model… ${Math.min(100, Math.round((got / total) * 100))}%`
      : `Loading the model… ${(got / 1e6).toFixed(1)} MB`;
  }
  const bytes = new Uint8Array(got);
  let at = 0;
  for (const p of parts) { bytes.set(p, at); at += p.length; }

  const embedder = createEmbedder(bytes.buffer, await (await fetch('models/vocab.txt')).text());
  const matcher = createMatcher(entries, embedder, MATCH_OPTIONS);
  loading.remove();
  document.body.classList.add('is-ready');

  let asking = false;
  /** @param {string} q */
  const ask = async (q) => {
    if (asking || !q.trim()) return;
    asking = true;
    setBusy(true);
    log.setAttribute('aria-busy', 'true');
    userRow(q);
    input.value = '';

    const t0 = performance.now();
    const ranked = matcher.rank(q);
    const ms = performance.now() - t0;
    const top = ranked[0];
    const hit = top.score >= THRESHOLD;

    const bubble = botRow();
    const trace = /** @type {HTMLDetailsElement} */ (el('details', 'trace'));
    trace.open = true;
    const summary = el('summary', 'trace-sum');
    const sumText = el('span', '', 'Searching…');
    summary.append(el('span', 'spin'), sumText);
    const list = el('ol', 'steps');
    trace.append(summary, list);
    bubble.append(trace);
    scrollDown();

    // 1. The word pieces the tokenizer produced.
    let s = step(list, 'Read your question');
    await wait(STEP_MS);
    const pieces = embedder.pieces(q);
    const chips = el('div', 'pieces');
    // A "##" piece continues the word before it ("emt" is em + ##t), so it is drawn joined to it.
    for (const p of pieces.slice(0, 14)) {
      const cont = p.text.startsWith('##');
      chips.append(el('code', [p.known ? '' : 'unk', cont ? 'cont' : ''].join(' ').trim(), cont ? p.text.slice(2) : p.text));
    }
    if (pieces.length > 14) chips.append(el('span', 'more-pieces', `+${pieces.length - 14}`));
    s.done(pieces.length ? chips : el('span', 'detail', 'No words the model knows.'));

    // 2. The sentence vector.
    s = step(list, `Turned it into ${embedder.dim} numbers`);
    await wait(STEP_MS);
    s.done(vectorStrip(top.vector));

    // 3. The comparison.
    s = step(list, `Compared it with ${matcher.size} phrasings`);
    await wait(STEP_MS);
    s.done(el('span', 'detail', `${entries.length} answers · cosine similarity`));

    // 4. The ranked matches.
    s = step(list, 'Ranked the closest answers');
    await wait(STEP_MS);
    const table = el('ul', 'matches');
    for (const r of ranked.slice(0, 3)) {
      const li = el('li', r === top && hit ? 'is-best' : '');
      const bar = el('span', 'bar');
      bar.style.setProperty('--w', `${Math.max(0, Math.min(1, r.score)) * 100}%`);
      li.append(el('span', 'm-text', `“${r.matched}”`), bar, el('span', 'm-score', r.score.toFixed(2)));
      table.append(li);
    }
    s.done(table);

    // 5. The confidence check against the threshold.
    s = step(list, hit ? 'Confident in the best match' : 'Not confident enough to answer');
    await wait(STEP_MS * 0.8);
    s.done(el('span', 'detail', hit
      ? `${top.score.toFixed(2)} clears the ${THRESHOLD} bar`
      : `${top.score.toFixed(2)} is under the ${THRESHOLD} bar, so I won't guess`));
    await wait(STEP_MS * 0.7);

    trace.open = false;
    trace.classList.add('is-done');
    sumText.textContent = `Searched ${matcher.size} phrasings · ${ms < 1 ? '<1' : ms.toFixed(1)} ms`;

    const entry = hit ? top.entry : null;
    const { box, words: n } = answerBlock(entry ? entry.answer : bank.fallback, entry?.points, entry?.detail);
    box.style.setProperty('--wms', `${WORD_MS}ms`);
    bubble.append(box);
    scrollDown();
    await wait(n * WORD_MS + 250);
    if (entry?.link) bubble.append(moreLink(entry.link));
    // Follow-ups: the two Sam picked for this answer, else the next-closest matches.
    const picked = /** @type {Entry[]} */ ((entry?.next ?? []).map((id) => byId.get(id)).filter(Boolean));
    bubble.append(chipRow(entry ? (picked.length ? picked : ranked.slice(1, 3).map((r) => r.entry)) : starters, ask));
    scrollDown();

    log.setAttribute('aria-busy', 'false');
    asking = false;
    setBusy(false);
    if (matchMedia('(pointer: fine)').matches) input.focus();
  };

  hello.append(chipRow(starters, ask));
  setBusy(false);
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    ask(input.value);
  });
}

/** @param {boolean} busy */
function setBusy(busy) {
  input.disabled = busy && !document.body.classList.contains('is-ready');
  send.disabled = busy;
}

main().catch((err) => {
  console.error(err);
  document.body.classList.add('is-error');
  const bubble = botRow();
  const p = el('p', 'answer', 'The model could not load here. You can reach Sam directly: ');
  const a = /** @type {HTMLAnchorElement} */ (el('a', '', 'batessambates@gmail.com'));
  a.href = 'mailto:batessambates@gmail.com';
  p.append(a);
  bubble.append(p);
});
