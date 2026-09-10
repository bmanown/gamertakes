import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@/jobs': path.resolve(__dirname, '../../jobs'),
      '@': path.resolve(__dirname, '.'),
    },
  },
})
