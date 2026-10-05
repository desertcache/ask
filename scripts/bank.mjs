// Parse qa.md (the reviewed answer bank) into entries. qa.md is the single source: edit it, then
// run `npm run build` to regenerate data/bank.json.

/**
 * @param {string} md
 * @returns {{ entries: { id: string, asks: string[], answer: string, link: string | null }[], fallback: string }}
 */
export function parseBank(md) {
  const entries = [];
  let fallback = '';
  for (const block of md.split(/^### /m).slice(1)) {
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
    const link = field('Link');
    entries.push({
      id,
      asks: asks.split(' · ').map((s) => s.trim()).filter(Boolean),
      answer,
      link: !link || link === 'none' ? null : link,
    });
  }
  if (!fallback) throw new Error('qa.md: missing the no-match fallback entry');
  const ids = entries.map((e) => e.id);
  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
  if (dup) throw new Error(`qa.md: duplicate id ${dup}`);
  return { entries, fallback };
}
