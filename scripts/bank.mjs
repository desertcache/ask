// Parse qa.md (the reviewed answer bank) into entries. qa.md is the single source: edit it, then
// run `npm run build` to regenerate data/bank.json.

/**
 * @typedef {{ id: string, asks: string[], answer: string, points: string[], next: string[], link: string | null }} Entry
 * @param {string} md
 * @returns {{ entries: Entry[], fallback: string }}
 */
export function parseBank(md) {
  const entries = [];
  let fallback = '';
  for (const block of md.replace(/\r\n/g, '\n').split(/^### /m).slice(1)) {
    const id = (block.match(/^\d+\.\s+([a-z0-9-]+)/) || [])[1];
    const field = (name) => (block.match(new RegExp(`^\\*\\*${name}:\\*\\*\\s*(.+)$`, 'm')) || [])[1]?.trim();
    const answer = field('Answer');
    if (!id || !answer) throw new Error(`qa.md: entry without an id or answer: ${block.slice(0, 60)}`);
    const asks = field('Asks like');
    if (!asks) {
      if (id !== 'no-match') throw new Error(`qa.md: ${id} has no "Asks like" line`);
      fallback = answer;
      continue;
    }
    // Highlights: the "- " lines under **Highlights:**, up to the next **Field:** line.
    const hl = block.match(/^\*\*Highlights:\*\*\s*\n((?:- .+\n?)+)/m);
    const points = hl ? hl[1].split('\n').map((l) => l.replace(/^- /, '').trim()).filter(Boolean) : [];
    const next = (field('Next') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    const link = field('Link');
    entries.push({
      id,
      asks: asks.split(' · ').map((s) => s.trim()).filter(Boolean),
      answer,
      points,
      next,
      link: !link || link === 'none' ? null : link,
    });
  }
  if (!fallback) throw new Error('qa.md: missing the no-match fallback entry');
  const ids = entries.map((e) => e.id);
  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
  if (dup) throw new Error(`qa.md: duplicate id ${dup}`);
  for (const e of entries) {
    for (const n of e.next) {
      if (n === e.id || !ids.includes(n)) throw new Error(`qa.md: ${e.id} has a bad Next id "${n}"`);
    }
  }
  return { entries, fallback };
}
