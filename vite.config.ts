import { fileURLToPath, URL } from 'node:url';
import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';
import dts from 'vite-plugin-dts';

const __dirname = fileURLToPath(new URL('./', import.meta.url));
const resolvePath = (p: string) => path.resolve(__dirname, p);

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueSetupExtend(),
    dts({
      insertTypesEntry: true,
      cleanVueFileName: true,
      include: ['src/index.ts', 'src/types/'],
      exclude: ['src/**/*.vue'],
      outDir: 'lib',
    }),
  ],
  resolve: {
    alias: {
      '@': resolvePath('src'),
    },
  },
  build: {
    outDir: resolvePath('lib'),
    emptyOutDir: true,
    lib: {
      entry: resolvePath('src/index.ts'),
      name: 'VueMovableBox',
      fileName: (format) => `vue-movable-box.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'decimal.js'],
      output: {
        globals: {
          vue: 'Vue',
          'decimal.js': 'Decimal',
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (/\.(css|less|scss)$/.test(name)) {
            return 'css/VueMovableBox.[ext]';
          }
          return '[name].[hash].[ext]';
        },
      },
    },
  },
});
