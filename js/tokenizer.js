// BERT uncased WordPiece, the tokenizer the potion models were distilled with (bge-base-en-v1.5).
// Mirrors Hugging Face's BertNormalizer (clean text, CJK padding, lowercase + strip accents),
// BertPreTokenizer (split on whitespace and punctuation) and WordPiece (greedy longest match, "##").
// tests/tokenizer.test.mjs checks it against the reference tokenizer.

const MAX_CHARS_PER_WORD = 100;

/** @param {number} cp */
function isControl(cp) {
  if (cp === 9 || cp === 10 || cp === 13) return false;
  return /\p{Cc}|\p{Cf}/u.test(String.fromCodePoint(cp));
}

/** @param {number} cp */
function isWhitespace(cp) {
  return cp === 32 || cp === 9 || cp === 10 || cp === 13 || /\p{Zs}/u.test(String.fromCodePoint(cp));
}

/** @param {number} cp */
function isPunctuation(cp) {
  if ((cp >= 33 && cp <= 47) || (cp >= 58 && cp <= 64) || (cp >= 91 && cp <= 96) || (cp >= 123 && cp <= 126)) return true;
  return /\p{P}/u.test(String.fromCodePoint(cp));
}

/** @param {number} cp */
function isCjk(cp) {
  return (cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf) || (cp >= 0x20000 && cp <= 0x2a6df) ||
    (cp >= 0x2a700 && cp <= 0x2b73f) || (cp >= 0x2b740 && cp <= 0x2b81f) || (cp >= 0x2b820 && cp <= 0x2ceaf) ||
    (cp >= 0xf900 && cp <= 0xfaff) || (cp >= 0x2f800 && cp <= 0x2fa1f);
}

/** @param {string} text */
function normalize(text) {
  let out = '';
  for (const ch of text) {
    const cp = /** @type {number} */ (ch.codePointAt(0));
    if (cp === 0 || cp === 0xfffd || isControl(cp)) continue;
    if (isWhitespace(cp)) out += ' ';
    else if (isCjk(cp)) out += ` ${ch} `;
    else out += ch;
  }
  return out.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '');
}

/** @param {string} text */
function preTokenize(text) {
  /** @type {string[]} */
  const words = [];
  let cur = '';
  for (const ch of text) {
    const cp = /** @type {number} */ (ch.codePointAt(0));
    if (cp === 32) {
      if (cur) words.push(cur);
      cur = '';
    } else if (isPunctuation(cp)) {
      if (cur) words.push(cur);
      words.push(ch);
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur) words.push(cur);
  return words;
}

/** @param {string} vocabText one token per line, line number = id */
export function createTokenizer(vocabText) {
  /** @type {Map<string, number>} */
  const vocab = new Map();
  const lines = vocabText.split(/\r?\n/);
  lines.forEach((tok, i) => { if (tok && !vocab.has(tok)) vocab.set(tok, i); });
  const unkId = vocab.get('[UNK]') ?? -1;

  /** @param {string} word */
  function wordPiece(word) {
    const chars = Array.from(word);
    if (chars.length > MAX_CHARS_PER_WORD) return [unkId];
    /** @type {number[]} */
    const ids = [];
    let start = 0;
    while (start < chars.length) {
      let end = chars.length;
      let id = -1;
      while (start < end) {
        const piece = (start > 0 ? '##' : '') + chars.slice(start, end).join('');
        const hit = vocab.get(piece);
        if (hit !== undefined) { id = hit; break; }
        end--;
      }
      if (id < 0) return [unkId];
      ids.push(id);
      start = end;
    }
    return ids;
  }

  return {
    unkId,
    /** Token ids without [CLS]/[SEP]. @param {string} text */
    encode(text) {
      return preTokenize(normalize(text)).flatMap(wordPiece);
    },
    /** The vocabulary string for a token id ("code", "##ing", "[UNK]"). @param {number} id */
    piece(id) {
      return lines[id] ?? '[UNK]';
    },
  };
}
