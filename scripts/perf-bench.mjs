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

// Scenario element counts can be narrowed for CI via BENCH_SCENARIOS=100,1000.
const SCENARIOS = (process.env.BENCH_SCENARIOS ?? '100,500,1000')
  .split(',')
  .map(Number)
  .filter(value => Number.isFinite(value) && value > 0);

// Warm-up runs prime JIT and layout caches; only measured rounds are reported.
const WARMUP_ROUNDS = 1;
const MEASURED_ROUNDS = 2;
// Frames longer than two 60Hz vsync intervals count as long frames.
const LONG_FRAME_MS = 34;

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
  const browser = await chromium.launch(executablePath ? { executablePath } : {});
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const results = [];

  const envInfo = await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    devicePixelRatio: window.devicePixelRatio,
    hardwareConcurrency: navigator.hardwareConcurrency ?? 0
  }));
  console.log(`environment: ${envInfo.userAgent}`);
  console.log(
    `devicePixelRatio=${envInfo.devicePixelRatio} hardwareConcurrency=${envInfo.hardwareConcurrency}`
  );

  // Frame recording is limited to the drag window. Each start mints a new token so
  // previous rAF loops die instead of stacking and double-counting frames.
  const startRecording = () =>
    page.evaluate(() => {
      window.__recordingToken = (window.__recordingToken ?? 0) + 1;
      const token = window.__recordingToken;
      window.__frames = [];
      let last = performance.now();
      const loop = now => {
        if (window.__recordingToken !== token) return;
        window.__frames.push(now - last);
        last = now;
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });

  const stopRecording = async () => {
    await page.evaluate(() => {
      window.__recordingToken = (window.__recordingToken ?? 0) + 1;
    });
    return page.evaluate(() => window.__frames.splice(0));
  };

  const rafTick = () =>
    page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => resolve(null))));

  const dragOnce = async () => {
    const box = page.locator('.auto-draggable').first();
    const bounds = await box.boundingBox();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await startRecording();
    await page.mouse.down();
    for (let step = 1; step <= 10; step += 1) {
      await page.mouse.move(
        bounds.x + bounds.width / 2 + step * 4,
        bounds.y + bounds.height / 2 + step * 2
      );
      // One move per animation frame so measured frames are working frames.
      await rafTick();
    }
    await page.mouse.up();
    const frames = await stopRecording();
    await page.waitForTimeout(120);
    return frames;
  };

  for (const count of SCENARIOS) {
    for (const mode of [
      { label: 'plain', query: '' },
      { label: 'snap+collision', query: '&snap=1&collision=1' },
      { label: 'writeback', query: '&writeback=1' },
      { label: 'group-collision-all', query: '&group=1&gc=all&collision=1' }
    ]) {
      const label = `${mode.label}(${count})`;
      await page.goto(`http://127.0.0.1:5199/examples/stress.html?count=${count}${mode.query}`);
      await page.waitForFunction(() => document.title === 'bench-ready', null, {
        timeout: 120_000
      });
      const mountMs = await page.evaluate(() => window.__bench.mountMs);

      const rounds = [];
      for (let round = 0; round < WARMUP_ROUNDS + MEASURED_ROUNDS; round += 1) {
        await page.evaluate(() => window.__benchReset?.());
        const frames = await dragOnce();
        if (round >= WARMUP_ROUNDS) rounds.push(frames);
      }

      const frames = rounds.flat();
      const busy = frames.filter(frame => frame > LONG_FRAME_MS);
      results.push({
        label,
        mountMs: Math.round(mountMs),
        frames: frames.length,
        p50: Math.round(percentile(frames, 0.5) * 10) / 10,
        p95: Math.round(percentile(frames, 0.95) * 10) / 10,
        max: Math.round(Math.max(...frames, 0) * 10) / 10,
        longFrameRatio: frames.length ? Math.round((busy.length / frames.length) * 1000) / 10 : 0
      });
      console.log(`done: ${label}`);
    }
  }

  console.table(results);
  const reportPath = path.join(root, 'bench-results.json');
  fs.writeFileSync(
    reportPath,
    `${JSON.stringify({ environment: envInfo, results }, null, 2)}
`
  );
  console.log(`results written to ${reportPath}`);

  await browser.close();
  await server.close();
};

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
