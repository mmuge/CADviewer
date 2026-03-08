import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@mlightcad/data-model/dist/dxf-parser-worker.js',
          dest: 'assets'
        },
        {
          src: 'node_modules/@mlightcad/data-model/dist/libredwg-parser-worker.js',
          dest: 'assets'
        },
        {
          src: 'node_modules/@mlightcad/data-model/dist/mtext-renderer-worker.js',
          dest: 'assets'
        }
      ]
    })
  ],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  optimizeDeps: {
    exclude: ['@mlightcad/cad-viewer', '@mlightcad/cad-simple-viewer', '@mlightcad/data-model']
  }
})
