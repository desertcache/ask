// Chosen 2026-10-04 on the held-out sets (see Evaluation in README.md): potion-base-4M with plain
// mean pooling beat 8M and the IDF/answer variants on the fresh set (v2: 52/66 first, 59/66 in the
// top 3) at half 8M's size. The threshold is where off-topic questions start falling back without
// costing in-scope ones; below it the box shows the fallback instead of a weak match.
export const MODEL = 'potion-base-4M';
export const MODEL_MB = 3.9;
export const THRESHOLD = 0.45;
export const MATCH_OPTIONS = { idf: false, answers: false };
// Small talk (bank entries with Kind: chat) needs a stronger match to win: see bestMatch in match.js.
export const CHAT_MIN = 0.6;

// Bank links are written relative to the portfolio, and they open there (in the top window when
// the box is embedded), never inside the box.
export const PORTFOLIO = 'https://desertcache.github.io/portfolio/';

// First-visit chips: the questions a recruiter most likely came with.
export const STARTERS = ['can-he-code', 'copilot', 'leadership', 'contact'];
