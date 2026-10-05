// The answer finder UI. Every word shown comes from data/bank.json (built from the reviewed qa.md);
// nothing is generated. Text goes in via textContent, never innerHTML.

import { createEmbedder } from './embed.js';
import { createMatcher } from './match.js';
import { MODEL, MODEL_MB, THRESHOLD, MATCH_OPTIONS, PORTFOLIO, STARTERS } from './config.js';

const $ = (sel) => /** @type {HTMLElement} */ (document.querySelector(sel));
const form = /** @type {HTMLFormElement} */ ($('#ask'));
const input = /** @type {HTMLInputElement} */ ($('#q'));
const button = /** @type {HTMLButtonElement} */ ($('#ask button'));
const status = $('#status');
const result = $('#result');
const chips = $('#chips');
const chipsLabel = $('#chips-label');
const meta = $('#meta');

/** @typedef {{ id: string, asks: string[], answer: string, link: string | null }} Entry */

/** @param {string} url */
async function fetchBytes(url, onProgress) {
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`${url}: ${res.status}`);
  const total = Number(res.headers.get('Content-Length')) || 0;
  const reader = res.body.getReader();
  const parts = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    got += value.length;
    onProgress(got, total);
  }
  const out = new Uint8Array(got);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out.buffer;
}

/** Answer text with the email address as a mailto link. @param {string} text */
function renderAnswer(text) {
  const p = document.createElement('p');
  p.className = 'answer';
  for (const [i, part] of text.split(/([\w.+-]+@[\w-]+\.[\w.]+)/).entries()) {
    if (i % 2) {
      const a = document.createElement('a');
      a.href = `mailto:${part}`;
      a.textContent = part;
      p.append(a);
    } else {
      p.append(part);
    }
  }
  return p;
}

/** @param {string} link */
function renderLink(link) {
  const external = /^https?:/.test(link) && !link.startsWith(PORTFOLIO);
  const a = document.createElement('a');
  a.className = 'more';
  a.href = new URL(link, PORTFOLIO).href;
  a.target = external ? '_blank' : '_top';
  if (external) a.rel = 'noopener';
  a.textContent = external ? 'Open ' : 'Read more on the site ';
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = external ? '↗' : '→';
  a.append(arrow);
  return a;
}

/** @param {string} label @param {Entry[]} entries @param {(e: Entry) => void} onPick */
function setChips(label, entries, onPick) {
  chipsLabel.textContent = label;
  chips.replaceChildren(...entries.map((e) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = e.asks[0];
    b.addEventListener('click', () => onPick(e));
    return b;
  }));
}

async function main() {
  const bank = await (await fetch('data/bank.json')).json();
  /** @type {Entry[]} */
  const entries = bank.entries;
  const byId = new Map(entries.map((e) => [e.id, e]));
  const starters = STARTERS.map((id) => byId.get(id)).filter(Boolean);

  /** @param {Entry | null} entry @param {Entry[]} related */
  const show = (entry, related) => {
    const card = document.createElement('div');
    card.className = 'card' + (entry ? '' : ' is-fallback');
    card.append(renderAnswer(entry ? entry.answer : bank.fallback));
    if (entry?.link) card.append(renderLink(entry.link));
    result.replaceChildren(card);
    if (entry) setChips('Related', related, pick);
    else setChips('Try one of these', starters, pick);
  };
  /** @param {Entry} entry */
  const pick = (entry) => {
    input.value = entry.asks[0];
    meta.textContent = '';
    show(entry, related(entry.id));
  };
  // Related chips for a picked entry: its nearest neighbours by its own first phrasing.
  let related = (/** @type {string} */ _id) => /** @type {Entry[]} */ ([]);

  setChips('Try asking', starters, pick);
  input.disabled = true;
  button.disabled = true;

  const weights = await fetchBytes(`models/${MODEL}.bin`, (got, total) => {
    status.textContent = `Loading a ${MODEL_MB} MB model onto your device… ${total ? Math.round((got / total) * 100) : Math.round(got / 1e5) / 10}${total ? '%' : ' MB'}`;
  });
  const vocab = await (await fetch('models/vocab.txt')).text();
  const embedder = createEmbedder(weights, vocab);
  const matcher = createMatcher(entries, embedder, MATCH_OPTIONS);
  related = (id) => matcher.rank(/** @type {Entry} */ (byId.get(id)).asks[0]).map((r) => r.entry).filter((e) => e.id !== id).slice(0, 2);

  status.textContent = 'Ready. Nothing you type leaves this page.';
  document.body.classList.add('is-ready');
  input.disabled = false;
  button.disabled = false;

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const q = input.value.trim();
    if (!q) return;
    const t0 = performance.now();
    const ranked = matcher.rank(q);
    const ms = performance.now() - t0;
    const top = ranked[0];
    const hit = top.score >= THRESHOLD;
    show(hit ? top.entry : null, ranked.slice(1, 3).map((r) => r.entry));
    meta.textContent = `Matched in ${ms < 1 ? '<1' : Math.round(ms)} ms · similarity ${top.score.toFixed(2)}${hit ? '' : ` (below ${THRESHOLD})`}`;
  });
}

main().catch((err) => {
  console.error(err);
  status.textContent = 'The model could not load here. Email Sam instead: batessambates@gmail.com';
  document.body.classList.add('is-error');
});
