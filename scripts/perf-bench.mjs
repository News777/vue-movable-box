/**
 * Performance benchmark for VueMovableBox interaction scenarios.
 *
 * Renders 100 / 500 / 1000 boxes (solo and fully-selected group) in a real Chromium,
 * drags the first box, and reports mount time plus pointer-event frame times.
 * Run with: pnpm bench
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';

const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)));

const resolveExecutable = () => {
  if (process.env.PLAYWRIGHT_EXECUTABLE_PATH) return process.env.PLAYWRIGHT_EXECUTABLE_PATH;
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ];
  return candidates.find(candidate => fs.existsSync(candidate));
};

const SCENARIOS = [100, 500, 1000];

const percentile = (values, share) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * share));
  return sorted[index];
};

const run = async () => {
  const server = await createServer({
    root,
    server: { host: '127.0.0.1', port: 5199, strictPort: true },
    logLevel: 'error'
  });
  await server.listen();

  const executablePath = resolveExecutable();
  const browser = await chromium.launch(
    executablePath ? { executablePath } : {}
  );
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const results = [];

  for (const count of SCENARIOS) {
    for (const grouped of [false, true]) {
      const label = grouped ? `group(${count})` : `solo(${count})`;
      await page.goto(
        `http://127.0.0.1:5199/examples/stress.html?count=${count}&group=${grouped ? 1 : 0}`
      );
      await page.waitForFunction(
        () => document.title === 'bench-ready',
        null,
        { timeout: 120_000 }
      );
      const mountMs = await page.evaluate(
        () => (window).__bench.mountMs
      );

      await page.evaluate(() => {
        window.__frames = [];
        let last = performance.now();
        const loop = now => {
          window.__frames.push(now - last);
          last = now;
          requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
      });

      const box = page.locator('.auto-draggable').first();
      const bounds = await box.boundingBox();
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      await page.mouse.down();
      for (let step = 1; step <= 10; step += 1) {
        await page.mouse.move(
          bounds.x + bounds.width / 2 + step * 4,
          bounds.y + bounds.height / 2 + step * 2
        );
      }
      await page.mouse.up();
      await page.waitForTimeout(150);

      const frames = (await page.evaluate(() => window.__frames.splice(0))).slice(1);
      const busy = frames.filter(frame => frame > 34);
      results.push({
        label,
        mountMs: Math.round(mountMs),
        frames: frames.length,
        p50: Math.round(percentile(frames, 0.5) * 10) / 10,
        p95: Math.round(percentile(frames, 0.95) * 10) / 10,
        max: Math.round(Math.max(...frames, 0) * 10) / 10,
        jank: busy.length
      });
      console.log(`done: ${label}`);
    }
  }

  console.table(results);

  await browser.close();
  await server.close();
};

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
