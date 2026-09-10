import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

const packageJson = JSON.parse(
  readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf8')
);

export default defineConfig({
  plugins: [vue()],
  // package.json is the single source of truth for the runtime version export.
  define: {
    __MOVABLE_BOX_VERSION__: JSON.stringify(packageJson.version)
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    include: ['src/**/*.spec.ts']
  }
});
