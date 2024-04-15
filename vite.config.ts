import { fileURLToPath, URL } from 'node:url';
import path from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import vueJsx from '@vitejs/plugin-vue-jsx';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';

const __dirname = fileURLToPath(new URL('./', import.meta.url));
const resolvePath = (p: string) => path.resolve(__dirname, p);
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueSetupExtend(),
    dts({
      outDir: resolvePath('lib'),
      include: [resolvePath('packages')],
      cleanVueFileName: true,
      tsconfigPath: resolvePath('tsconfig.json'),
    }),
  ],
  resolve: {
    alias: {
      '@': resolvePath('packages/AutoDraggable'),
    },
  },
  build: {
    outDir: resolvePath('lib'),
    lib: {
      entry: resolvePath('packages/index.ts'), // 你的插件入口文件
      name: 'VueAutoDraggable',
      fileName: (format) => `vue-auto-draggable.${format}.js`,
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue'],
      output: {
        // 为了 Vue 插件，通常你想打包为 UMD
        globals: {
          vue: 'vue',
        },
        // 配置 CSS 文件的生成名称
        // 这会影响所有 chunk 的名称，包括 JavaScript 和其他资源
        assetFileNames: ({ name }) => {
          if (/\.(css|less|scss)$/.test(name ?? '')) {
            return 'css/VueAutoDraggable.[ext]';
          }
          return '[name].[hash].[ext]';
        },
      },
    },
  },
  server: {
    port: 9527,
  },
});
