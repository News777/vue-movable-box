import { describe, expect, it } from 'vitest';
import packageJson from '../package.json';
import VueMovableBox, { install, name, version } from './index';

describe('package version (single source of truth)', () => {
  it('keeps the runtime exports in sync with package.json', () => {
    expect(name).toBe('VueMovableBox');
    expect(version).toBe(packageJson.version);
    expect(VueMovableBox.version).toBe(packageJson.version);
    expect(typeof install).toBe('function');
    expect(VueMovableBox.install).toBe(install);
  });
});
