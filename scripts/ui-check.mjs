// Drive index.html in an isolated headless Chrome (own temp profile): load, ask questions, tap a
// chip, and screenshot at desktop and phone widths. Reports bytes transferred and console errors.
// Needs `node scripts/serve.mjs 8093 [--gzip]` running. Usage: node scripts/ui-check.mjs <outdir>

import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const outDir = process.argv[2] ?? 'shots';
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
try {
  for (const [name, viewport, mobile] of [['desktop', { width: 760, height: 560 }, false], ['phone', { width: 390, height: 720 }, true]]) {
    const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${name}: ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
    let bytes = 0;
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; });

    const t0 = Date.now();
    await page.goto('http://localhost:8093/');
    await page.waitForSelector('body.is-ready', { timeout: 30_000 });
    console.log(`${name}: ready in ${Date.now() - t0} ms, ${(bytes / 1e6).toFixed(2)} MB transferred`);
    await page.screenshot({ path: `${outDir}/${name}-1-ready.png` });

    for (const [i, q] of ['does he actually write code', 'tell me a joke'].entries()) {
      await page.fill('#q', q);
      await page.press('#q', 'Enter');
      await page.waitForSelector('.card');
      await page.waitForTimeout(500); // let the card's rise-in finish before judging it
      const shown = await page.textContent('.card .answer');
      console.log(`${name}: "${q}" -> ${shown.slice(0, 70)}… | ${await page.textContent('#meta')}`);
      await page.screenshot({ path: `${outDir}/${name}-${i + 2}-${q.split(' ')[0]}.png` });
    }
    await page.click('.chip >> nth=0');
    console.log(`${name}: chip -> ${(await page.inputValue('#q'))} | ${(await page.textContent('.card .answer')).slice(0, 60)}…`);
    const link = await page.getAttribute('.card .more', 'href');
    console.log(`${name}: link ${link}`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    console.log(`${name}: horizontal overflow ${overflow}`);
    await ctx.close();
  }
} finally {
  await browser.close();
}
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no console errors');
