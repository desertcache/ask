// Dev server for the repo root with the MIME types ES modules and WASM need, and an optional
// gzip mode that mimics GitHub Pages so download sizes can be measured.
// Usage: node scripts/serve.mjs [port=8093] [--gzip]

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.argv.find((a) => /^\d+$/.test(a)) ?? 8093);
const gzip = process.argv.includes('--gzip');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.wasm': 'application/wasm', '.txt': 'text/plain; charset=utf-8',
  '.bin': 'application/octet-stream', '.onnx': 'application/octet-stream', '.svg': 'image/svg+xml',
};

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  if (path.startsWith('..')) { res.writeHead(403).end(); return; }
  try {
    let body = await readFile(join(root, path.endsWith('\\') || path.endsWith('/') || !path ? join(path, 'index.html') : path));
    const headers = { 'Content-Type': TYPES[extname(path) || '.html'] ?? 'application/octet-stream', 'Cache-Control': 'no-store' };
    if (gzip && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
      body = gzipSync(body);
      headers['Content-Encoding'] = 'gzip';
    }
    res.writeHead(200, headers).end(body);
  } catch {
    res.writeHead(404).end('not found');
  }
}).listen(port, () => console.log(`http://localhost:${port}/${gzip ? '  (gzip on)' : ''}`));
