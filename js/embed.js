// A model2vec static embedding model: every token id maps to one vector, and a sentence is the
// mean of its token vectors, L2-normalized. No neural network runs at question time, so there is
// no inference engine to download.
//
// Weights file (written by scripts/build.mjs), little-endian:
//   u32 rows, u32 dim, f32[rows] per-row scales, i8[rows * dim] quantized rows (value = i8 * scale)

import { createTokenizer } from './tokenizer.js';

/**
 * @param {ArrayBuffer} weights
 * @param {string} vocabText
 */
export function createEmbedder(weights, vocabText) {
  const head = new DataView(weights, 0, 8);
  const rows = head.getUint32(0, true);
  const dim = head.getUint32(4, true);
  const scales = new Float32Array(weights, 8, rows);
  const data = new Int8Array(weights, 8 + rows * 4, rows * dim);
  const tokenizer = createTokenizer(vocabText);

  return {
    dim,
    /** Token ids that embed() pools over. @param {string} text */
    tokens(text) {
      // model2vec drops [UNK] before pooling, so gibberish embeds to nothing instead of to [UNK].
      return tokenizer.encode(text).filter((id) => id !== tokenizer.unkId && id < rows);
    },
    /**
     * @param {string} text
     * @param {(id: number) => number} [weight] per-token pooling weight (default 1)
     * @returns {Float32Array} unit vector, or all zeros if no known tokens
     */
    embed(text, weight) {
      const out = new Float32Array(dim);
      for (const id of this.tokens(text)) {
        const s = scales[id] * (weight ? weight(id) : 1);
        const base = id * dim;
        for (let j = 0; j < dim; j++) out[j] += data[base + j] * s;
      }
      let norm = 0;
      for (let j = 0; j < dim; j++) norm += out[j] * out[j];
      norm = Math.sqrt(norm);
      if (norm > 0) for (let j = 0; j < dim; j++) out[j] /= norm;
      return out;
    },
  };
}
