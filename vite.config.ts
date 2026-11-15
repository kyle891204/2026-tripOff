import { fileURLToPath, URL } from 'node:url'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function offlineDemo(): Plugin {
  return {
    name: 'tripoff-offline-demo',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const assets = [...new Set(['index.html', 'favicon.svg', ...Object.keys(bundle)])].sort()
      const template = readFileSync(new URL('./src/offline/sw-template.js', import.meta.url), 'utf8')
      const version = createHash('sha256').update(JSON.stringify(assets)).update(template).digest('hex').slice(0, 16)
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: template.replace('__TRIPOFF_CACHE_VERSION__', version)
          .replace('/*__TRIPOFF_PRECACHE__*/ []', JSON.stringify(assets)),
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), offlineDemo()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
