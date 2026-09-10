import { fileURLToPath, URL } from 'node:url';
import path from 'path';
import { createRequire } from 'node:module';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';
import dts from 'vite-plugin-dts';

const __dirname = fileURLToPath(new URL('./', import.meta.url));
const resolvePath = (p: string) => path.resolve(__dirname, p);
const require = createRequire(import.meta.url);
const packageVersion: string = require('./package.json').version;

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueSetupExtend(),
    dts({
      insertTypesEntry: true,
      cleanVueFileName: true,
      include: [
        'src/index.ts',
        'src/types/',
        'src/components/MovableBox/MovableBox.vue',
        'src/components/MovableGroup/MovableGroup.vue'
      ],
      exclude: ['src/**/*.spec.ts'],
      outDir: 'lib',
      afterDiagnostic(diagnostics) {
        if (diagnostics.length > 0) {
          throw new Error(`Declaration generation failed with ${diagnostics.length} diagnostic(s).`);
        }
      }
    })
  ],
  // package.json is the single source of truth for the runtime version export.
  define: {
    __MOVABLE_BOX_VERSION__: JSON.stringify(packageVersion)
  },
  resolve: {
    alias: {
      '@': resolvePath('src')
    }
  },
  build: {
    outDir: resolvePath('lib'),
    emptyOutDir: true,
    lib: {
      entry: resolvePath('src/index.ts'),
      name: 'VueMovableBox',
      formats: ['es', 'cjs', 'umd'],
      fileName: format => (format === 'cjs' ? 'vue-movable-box.cjs' : `vue-movable-box.${format}.js`)
    },
    rollupOptions: {
      external: ['vue', 'decimal.js'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'decimal.js': 'Decimal'
        },
        assetFileNames: assetInfo => {
          const name = assetInfo.name || '';
          if (/\.(css|less|scss)$/.test(name)) {
            return 'css/VueMovableBox.[ext]';
          }
          return '[name].[hash].[ext]';
        }
      }
    }
  }
});
