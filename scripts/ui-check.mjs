// Drive index.html in an isolated headless Chrome (own temp profile, so it never touches a browser
// another session is driving): load, ask, watch the trace, tap a chip, and screenshot at desktop,
// phone and embedded sizes. Reports bytes transferred, answers and console errors.
// Needs `node scripts/serve.mjs 8093 [--gzip]` running, or BASE=<url> for a deployed copy.
// Usage: [BASE=https://desertcache.github.io/ask/] node scripts/ui-check.mjs <outdir>

import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const base = process.env.BASE ?? 'http://localhost:8093/';
const outDir = process.argv[2] ?? 'shots';
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const errors = [];
const lastBot = '.msg.bot:last-child';

const runs = [
  ['desktop', { width: 820, height: 760 }, false, ''],
  ['phone', { width: 390, height: 760 }, true, ''],
  ['embed', { width: 640, height: 560 }, false, '?embed=1'],
];
try {
  for (const [name, viewport, mobile, query] of runs) {
    const ctx = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${name}: ${m.text()}`); });
    page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
    let bytes = 0;
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; });

    const t0 = Date.now();
    await page.goto(base + query);
    await page.waitForSelector('body.is-ready', { timeout: 60_000 });
    console.log(`${name}: ready in ${Date.now() - t0} ms, ${(bytes / 1e6).toFixed(2)} MB transferred`);
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${outDir}/${name}-1-ready.png` });

    for (const [i, q] of ['does he actually write code', 'tell me a joke'].entries()) {
      await page.fill('#q', q);
      await page.press('#q', 'Enter');
      const t1 = Date.now();
      if (i === 0) {
        await page.waitForSelector(`${lastBot} .step:nth-child(3)`);
        await page.screenshot({ path: `${outDir}/${name}-2-thinking.png` });
      }
      await page.waitForSelector(`${lastBot} .chips`, { timeout: 30_000 });
      const took = Date.now() - t1;
      await page.waitForTimeout(450);
      const shown = await page.textContent(`${lastBot} .answer`);
      const sum = await page.textContent(`${lastBot} .trace-sum`);
      const best = await page.textContent(`${lastBot} .matches li:first-child`);
      console.log(`${name}: "${q}" -> ${shown.slice(0, 60)}… | ${sum} | top: ${best.replace(/\s+/g, ' ')} | full reply in ${took} ms`);
      await page.screenshot({ path: `${outDir}/${name}-${i + 3}-${q.split(' ')[0]}.png` });
    }
    await page.click(`${lastBot} .chip >> nth=0`);
    await page.waitForFunction(() => document.querySelectorAll('.msg.bot').length === 4 && document.querySelector('.msg.bot:last-child .chips'), null, { timeout: 15_000 });
    console.log(`${name}: chip -> ${(await page.textContent('.msg.me:nth-last-child(2) .bubble'))} | ${(await page.textContent(`${lastBot} .answer`)).slice(0, 50)}…`);
    await page.click(`${lastBot} .trace-sum`);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${outDir}/${name}-5-trace-open.png` });
    const link = await page.getAttribute(`${lastBot} .more`, 'href').catch(() => null);
    console.log(`${name}: link ${link} | horizontal overflow ${await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)}`);
    await ctx.close();
  }

  // Reduced motion: no pacing, no streaming.
  const ctx = await browser.newContext({ viewport: { width: 820, height: 760 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base);
  await page.waitForSelector('body.is-ready', { timeout: 60_000 });
  const t1 = Date.now();
  await page.fill('#q', 'where is he based');
  await page.press('#q', 'Enter');
  await page.waitForSelector(`${lastBot} .chips`);
  console.log(`reduced-motion: answered in ${Date.now() - t1} ms -> ${(await page.textContent(`${lastBot} .answer`)).slice(0, 50)}…`);
  await ctx.close();
} finally {
  await browser.close();
}
console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'no console errors');
