#!/usr/bin/env node
/**
 * Verifies the actual publishable tarball in an isolated consumer environment:
 * - `npm pack` of this repo, extracted (not linked) into a consumer node_modules;
 * - ESM import (node entry), CommonJS require (real `.cjs` entry), browser-style UMD load;
 * - component and plugin shapes, CSS subpath, TypeScript declarations;
 * - runtime default-export version === package.json version (single source of truth).
 *
 * The consumer directory lives inside the repository so peer dependencies (vue) and the
 * published dependency (decimal.js) resolve through the normal Node resolution chain,
 * exactly as they would in a real project.
 *
 * Run after `pnpm build`. Exits non-zero on the first failed check.
 */

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = require(path.join(rootDir, 'package.json'));
const consumerDir = path.join(rootDir, '.package-consume-test');

const checks = [];
const pass = message => {
  console.log(`✓ ${message}`);
  checks.push(message);
};
const fail = message => {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
};
const die = message => {
  fail(message);
  throw new Error(message);
};

const run = (command, args, options = {}) =>
  spawnSync(command, args, {
    encoding: 'utf8',
    cwd: rootDir,
    shell: process.platform === 'win32',
    ...options
  });

try {
  if (!existsSync(path.join(rootDir, 'lib', 'vue-movable-box.es.js'))) {
    die('lib/ is missing; run `pnpm build` before the package consumption check.');
  }

  rmSync(consumerDir, { recursive: true, force: true });
  mkdirSync(consumerDir, { recursive: true });
  const consumerNodeModules = path.join(consumerDir, 'node_modules');

  // The consumer environment resolves vue and decimal.js by walking up to the
  // repository's node_modules. Verify both are resolvable up front so a stripped
  // environment fails with a clear message instead of a MODULE_NOT_FOUND per check.
  const consumerRequire = createRequire(path.join(consumerDir, 'package.json'));
  for (const dependency of ['vue', 'decimal.js']) {
    try {
      consumerRequire.resolve(dependency);
    } catch {
      die(
        `Dependency "${dependency}" is not resolvable from the repository root; ` +
          'run `pnpm install` before the package consumption check.'
      );
    }
  }
  const packageDir = path.join(consumerNodeModules, packageJson.name);

  // --- 1. Pack the repository the way `npm publish` would -------------------------
  const pack = run('npm', ['pack', '--json', '--pack-destination', consumerDir]);
  if (pack.status !== 0) {
    die(`npm pack failed: ${pack.stderr || pack.stdout}`);
  }
  const packInfo = JSON.parse(pack.stdout)[0];
  if (packInfo.name !== packageJson.name || packInfo.version !== packageJson.version) {
    die(`tarball identity mismatch: ${packInfo.name}@${packInfo.version}`);
  }
  pass(`tarball packed: ${packInfo.filename}`);

  // --- 2. Install the extracted tarball into the consumer environment -------------
  // Extract with a bare filename: Windows GNU tar misreads `D:\...` as a remote host.
  const extracted = run('tar', ['-xzf', packInfo.filename], { cwd: consumerDir });
  if (extracted.status !== 0) {
    die(`tar extract failed: ${extracted.stderr}`);
  }
  cpSync(path.join(consumerDir, 'package'), packageDir, { recursive: true });
  rmSync(path.join(consumerDir, 'package'), { recursive: true, force: true });

  const consumedPackageJson = JSON.parse(
    readFileSync(path.join(packageDir, 'package.json'), 'utf8')
  );
  if (consumedPackageJson.version !== packageJson.version) {
    die(`tarball package.json version ${consumedPackageJson.version} !== ${packageJson.version}`);
  }
  for (const file of [
    'lib/vue-movable-box.es.js',
    'lib/vue-movable-box.cjs',
    'lib/vue-movable-box.umd.js',
    'lib/index.d.ts',
    'lib/css/VueMovableBox.css'
  ]) {
    if (!existsSync(path.join(packageDir, file))) {
      die(`tarball is missing ${file}`);
    }
  }
  pass('tarball contains ESM, CJS, UMD, declarations, and the CSS subpath');

  for (const field of ['unpkg', 'jsdelivr']) {
    const target = consumedPackageJson[field];
    if (!target || !existsSync(path.join(packageDir, target))) {
      fail(`CDN field "${field}" is missing or points to a nonexistent file: ${target}`);
    }
  }
  pass('CDN fields (unpkg/jsdelivr) point at the UMD bundle');

  const mainEntry = consumedPackageJson.main ?? '';
  const requireEntry = consumedPackageJson.exports?.['.']?.require ?? '';
  if (mainEntry !== requireEntry) {
    fail(`main (${mainEntry}) and exports['.'].require (${requireEntry}) disagree`);
  } else if (!mainEntry.endsWith('.cjs')) {
    fail(`CommonJS entry must be a real .cjs file, got: ${mainEntry}`);
  } else {
    pass(`CommonJS entry is a real .cjs file: ${mainEntry}`);
  }

  // --- 3. ESM consumption ----------------------------------------------------------
  const esmProbe = path.join(consumerDir, 'consume-es.mjs');
  writeEsmProbe(esmProbe);
  const esm = run('node', ['consume-es.mjs'], { cwd: consumerDir });
  if (esm.status !== 0) {
    fail(`ESM consumption failed: ${esm.stderr || esm.stdout}`);
  } else {
    pass(`ESM import exposes component, plugin install, and version ${packageJson.version}`);
  }

  // --- 4. CommonJS consumption -----------------------------------------------------
  const cjsProbe = path.join(consumerDir, 'consume-cjs.cjs');
  writeCjsProbe(cjsProbe);
  const cjs = run('node', ['consume-cjs.cjs'], { cwd: consumerDir });
  if (cjs.status !== 0) {
    fail(`CommonJS consumption failed: ${cjs.stderr || cjs.stdout}`);
  } else {
    pass(`require() exposes named exports and version ${packageJson.version}`);
  }

  // --- 5. Browser global consumption (UMD) -----------------------------------------
  const umdResult = consumeUmdGlobal(packageDir, packageJson.version);
  if (!umdResult.ok) {
    fail(`UMD global consumption failed: ${umdResult.message}`);
  } else {
    pass('UMD global exposes VueMovableBox with install for Vue.createApp(...).use(...)');
  }

  // --- 6. Declared Vue compatibility range ------------------------------------------
  // The installed vue must satisfy the package's peerDependencies range so the checks
  // above run against a supported host.
  const peerRange = consumedPackageJson.peerDependencies?.vue ?? '';
  const installedVue = JSON.parse(
    readFileSync(path.join(rootDir, 'node_modules/vue/package.json'), 'utf8')
  );
  if (!satisfiesCaretRange(installedVue.version, peerRange)) {
    fail(`installed vue ${installedVue.version} does not satisfy declared range "${peerRange}"`);
  } else {
    pass(`installed vue ${installedVue.version} satisfies declared peer range "${peerRange}"`);
  }

  // --- 7. CSS and TypeScript declarations ------------------------------------------
  const css = readFileSync(path.join(packageDir, 'lib/css/VueMovableBox.css'), 'utf8');
  if (!css.includes('.auto-draggable')) {
    fail('CSS subpath does not contain the component styles');
  } else {
    pass('CSS subpath contains the component styles');
  }

  const declarations = readFileSync(path.join(packageDir, 'lib/index.d.ts'), 'utf8');
  const missingSymbols = ['MovableBox', 'MovableGroup', 'MovableBoxProps', 'SnapTarget'].filter(
    symbol => !declarations.includes(symbol)
  );
  if (missingSymbols.length > 0) {
    fail(`declarations are missing: ${missingSymbols.join(', ')}`);
  } else {
    pass('TypeScript declarations cover the public surface');
  }
} finally {
  rmSync(consumerDir, { recursive: true, force: true });
}

if (process.exitCode) {
  console.error('\nPackage consumption check FAILED.');
  process.exit(process.exitCode);
}
console.log(`\nAll ${checks.length} package consumption checks passed.`);

/**
 * Evaluates a simple caret range ("^3.3.0", "^3.3", "^3") against a concrete version.
 * Prerelease suffixes on the version ("3.5.0-rc.1") are ignored for comparison.
 */
function satisfiesCaretRange(version, range) {
  const rangeMatch = /^\^(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(range.trim());
  if (!rangeMatch) return false;
  const versionMatch = /^(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!versionMatch) return false;
  const [, major, minor, patch] = versionMatch.map(Number);
  const minMajor = Number(rangeMatch[1]);
  const minMinor = Number(rangeMatch[2] ?? 0);
  const minPatch = Number(rangeMatch[3] ?? 0);
  if (major !== minMajor) return false;
  if (major === 0) {
    return minor === minMinor && patch >= minPatch;
  }
  return minor > minMinor || (minor === minMinor && patch >= minPatch);
}

function writeEsmProbe(file) {
  const source = `
import VueMovableBox, { MovableBox, MovableGroup, name } from '${packageJson.name}';
import { createApp } from 'vue';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
assert(name === 'VueMovableBox', 'named export name mismatch');
assert(MovableBox && (typeof MovableBox.setup === 'function' || typeof MovableBox.render === 'function'),
  'MovableBox is not a consumable component definition');
assert(MovableGroup && (typeof MovableGroup.setup === 'function' || typeof MovableGroup.render === 'function'),
  'MovableGroup is not a consumable component definition');
assert(typeof VueMovableBox.install === 'function', 'default export is not a Vue plugin');
assert(VueMovableBox.version === '${packageJson.version}',
  \`default export version \${VueMovableBox.version} !== ${packageJson.version}\`);
const app = createApp({ render: () => null });
app.use(VueMovableBox);
console.log('esm-ok');
`;
  writeFileSync(file, source);
}

function writeCjsProbe(file) {
  const source = `
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const lib = require('${packageJson.name}');
const { MovableBox, MovableGroup, name } = lib;
assert(name === 'VueMovableBox', 'named export name mismatch');
assert(MovableBox && (typeof MovableBox.setup === 'function' || typeof MovableBox.render === 'function'),
  'MovableBox is not consumable through require()');
assert(MovableGroup && (typeof MovableGroup.setup === 'function' || typeof MovableGroup.render === 'function'),
  'MovableGroup is not consumable through require()');
assert(lib.default && typeof lib.default.install === 'function', 'default export is not a Vue plugin');
assert(lib.default.version === '${packageJson.version}',
  \`default export version \${lib.default.version} !== ${packageJson.version}\`);
console.log('cjs-ok');
`;
  writeFileSync(file, source);
}

function consumeUmdGlobal(packageDir, expectedVersion) {
  const context = { console };
  context.globalThis = context;
  context.window = context;
  vm.createContext(context);
  const loadScript = (filename, absolutePath) => {
    const code = readFileSync(absolutePath, 'utf8');
    vm.runInContext(code, context, { filename });
  };
  try {
    // Peers and dependencies resolve from the repository's own node_modules.
    loadScript('vue.global.js', path.join(rootDir, 'node_modules/vue/dist/vue.global.js'));
    loadScript('decimal.js', path.join(rootDir, 'node_modules/decimal.js/decimal.js'));
    loadScript('vue-movable-box.umd.js', path.join(packageDir, 'lib/vue-movable-box.umd.js'));
    const globalLib = context.VueMovableBox;
    if (!globalLib) return { ok: false, message: 'window.VueMovableBox was not defined' };
    if (typeof globalLib.install !== 'function') {
      return { ok: false, message: 'UMD global has no install function' };
    }
    if (globalLib.version !== expectedVersion) {
      return { ok: false, message: `UMD version ${globalLib.version} !== ${expectedVersion}` };
    }
    if (!context.Vue || typeof context.Vue.createApp !== 'function') {
      return { ok: false, message: 'Vue global build without createApp' };
    }
    const app = context.Vue.createApp({ template: '<div />' });
    app.use(globalLib);
    if (!app._context.components || !app._context.components.VueMovableBox) {
      return { ok: false, message: 'plugin installation did not register the components' };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error?.stack ?? String(error) };
  }
}
