import { defineConfig } from 'vitest/config'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

// Load the local dev environment (DATABASE_URL for the DB-backed tests).
// In CI the variable comes from the job environment instead.
try {
  process.loadEnvFile('.env.local')
} catch {
  // no .env.local — fine
}

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(here, 'src'),
    },
  },
})
