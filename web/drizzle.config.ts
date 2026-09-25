import { defineConfig } from 'drizzle-kit'

// drizzle-kit doesn't load .env files itself — pick up the local dev one if present.
try {
  process.loadEnvFile('.env.local')
} catch {
  // no .env.local — DATABASE_URL must come from the environment
}

export default defineConfig({
  dialect: 'mysql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
})
