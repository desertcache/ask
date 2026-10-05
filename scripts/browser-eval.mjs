// Run eval/browser.html in an isolated headless Chrome (its own temp profile, so it never touches
// a browser another session is driving) and print the report.
// Needs `node scripts/serve.mjs 8093` running. Usage: node scripts/browser-eval.mjs [questions file]

import { chromium } from 'playwright-core';

const q = process.argv[2] ? `?q=${process.argv[2]}` : '';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage();
  const failed = new Promise((_, reject) => page.on('pageerror', (e) => reject(new Error(`page error: ${e.message}`))));
  await page.goto(`http://localhost:8093/eval/browser.html${q}`);
  await Promise.race([failed, page.waitForFunction(() => window.__done === true, null, { timeout: 15 * 60_000 })]);
  console.log(await page.textContent('#out'));
} finally {
  await browser.close();
}
