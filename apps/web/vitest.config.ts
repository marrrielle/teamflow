import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Kept separate from vite.config.ts: vitest's bundled `vite` dependency and this
// project's own (newer) top-level `vite` don't resolve to the same type declarations,
// so merging `test` into the same defineConfig call as dev/build fails to typecheck
// even though both configs work correctly at runtime. Vitest picks this file up over
// vite.config.ts automatically when both are present.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
