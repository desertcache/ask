#!/usr/bin/env bash
# Download the source models into models-src/ (gitignored). Only models/potion-base-4M.bin and
# models/vocab.txt ship; everything else here is for `npm run build`, the tests and the evals.
# curl, not Node: Node's fetch to the Hugging Face CDN timed out on this machine (2026-10-04).
set -euo pipefail
cd "$(dirname "$0")/.."
for m in potion-base-2M potion-base-4M potion-base-8M; do
  mkdir -p "models-src/$m"
  for f in model.safetensors tokenizer.json tokenizer_config.json config.json vocab.txt; do
    curl -sfL -o "models-src/$m/$f" "https://huggingface.co/minishlab/$m/resolve/main/$f"
  done
done
# Transformer baselines for eval/browser.html only.
for m in Xenova/all-MiniLM-L6-v2 Xenova/paraphrase-MiniLM-L3-v2 Xenova/bge-small-en-v1.5; do
  mkdir -p "models-src/$m/onnx"
  for f in config.json tokenizer.json tokenizer_config.json special_tokens_map.json onnx/model_quantized.onnx; do
    curl -sfL -o "models-src/$m/$f" "https://huggingface.co/$m/resolve/main/$f"
  done
done
echo "done"
