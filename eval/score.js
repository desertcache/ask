// Scoring shared by the Node run (eval/run.mjs) and the browser run (eval/browser.html).
// A question counts as right when the answer shown (bestMatch: the same rule the UI uses) is in
// its `expect` list, or when `expect` includes "none" and the box declines. Off-topic questions
// must be declined.

import { bestMatch } from '../js/match.js';

export const VARIANTS = {
  plain: { idf: false, answers: false },
  idf: { idf: true, answers: false },
  answers: { idf: false, answers: true },
  'idf+answers': { idf: true, answers: true },
};

/** @param {{ rank(q: string): { entry: { id: string, chat?: boolean }, score: number }[] }} matcher */
export function score(matcher, { inScope, offTopic }) {
  return {
    scope: inScope.map(({ q, expect }) => {
      const ranked = matcher.rank(q);
      return { q, expect, ranked, top3: ranked.slice(0, 3).map((r) => r.entry.id) };
    }),
    off: offTopic.map((q) => ({ q, ranked: matcher.rank(q) })),
  };
}

export function sweep({ scope, off }) {
  const rows = [];
  for (let i = 0; i <= 12; i++) {
    const th = 0.2 + i * 0.05;
    const right = scope.filter(({ expect, ranked }) => {
      const hit = bestMatch(ranked, th);
      return hit ? expect.includes(hit.entry.id) : expect.includes('none');
    }).length;
    // Top 3: the answer shown or one of the two "related" chips under it is right.
    const right3 = scope.filter(({ expect, ranked, top3 }) => {
      const hit = bestMatch(ranked, th);
      return hit ? [hit.entry.id, ...top3].some((id) => expect.includes(id)) : expect.includes('none');
    }).length;
    const rejected = off.filter(({ ranked }) => !bestMatch(ranked, th)).length;
    rows.push({ th: th.toFixed(2), right, right3, rejected, total: right + rejected, of: `${scope.length}/${off.length}` });
  }
  return rows;
}

export function formatSweep(name, rows) {
  const best = Math.max(...rows.map((r) => r.total));
  const [nIn, nOff] = rows[0].of.split('/');
  return [`\n${name}`, ...rows.map((r) =>
    `  th ${r.th}  in-scope ${String(r.right).padStart(3)}/${nIn}  top-3 ${String(r.right3).padStart(3)}/${nIn}  off-topic rejected ${String(r.rejected).padStart(2)}/${nOff}${r.total === best ? '  <- best' : ''}`)].join('\n');
}

export function misses({ scope, off }, th) {
  const lines = [];
  for (const { q, expect, ranked } of scope) {
    const hit = bestMatch(ranked, th);
    const ok = hit ? expect.includes(hit.entry.id) : expect.includes('none');
    if (!ok) lines.push(`MISS  ${q.padEnd(55)} -> ${hit ? hit.entry.id : '(fallback)'} ${(hit ?? ranked[0]).score.toFixed(2)}  want ${expect.join('|')}`);
  }
  for (const { q, ranked } of off) {
    const hit = bestMatch(ranked, th);
    if (hit) lines.push(`LEAK  ${q.padEnd(55)} -> ${hit.entry.id} ${hit.score.toFixed(2)}`);
  }
  return lines.join('\n');
}
