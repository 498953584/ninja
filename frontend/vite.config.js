import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
// import vitePluginAsyncCatch from 'vite-plugin-async-catch'
import {
  createStyleImportPlugin,
  ElementPlusResolve,
} from 'vite-plugin-style-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vitePluginAsyncCatch({ catchCode: `console.error(e)` }),
    createStyleImportPlugin({
      resolves: [ElementPlusResolve()],
      libs: [
        {
          libraryName: 'element-plus',
          esModule: true,
          ensureStyleFile: true,
          resolveStyle: (name) => {
            return `element-plus/theme-chalk/${name}.css`;
          }
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: '../backend/static',
    emptyOutDir: true,
  },
})
