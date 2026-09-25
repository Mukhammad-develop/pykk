// Runs the Drizzle migrations. Bundled by esbuild into deploy/migrate.mjs for
// the server (update.sh runs it after every app update); locally `pnpm db:migrate`
// (drizzle-kit) is the easier path.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'
import { migrate } from 'drizzle-orm/mysql2/migrator'

const here = path.dirname(fileURLToPath(import.meta.url))

// The bundled file sits next to the server's .env — load it if present.
try {
  process.loadEnvFile(path.join(here, '.env'))
} catch {
  // fine — DATABASE_URL may come from the environment
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set (looked in .env next to this script and in the environment)')
  process.exit(1)
}

const migrationsFolder = path.join(here, 'drizzle')
if (!fs.existsSync(migrationsFolder)) {
  console.error(`Migrations folder not found: ${migrationsFolder}`)
  process.exit(1)
}

const connection = await mysql.createConnection(url)
try {
  await migrate(drizzle(connection), { migrationsFolder })
  console.log('✔ Migrations applied')
} finally {
  await connection.end()
}
