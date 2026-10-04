import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
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
