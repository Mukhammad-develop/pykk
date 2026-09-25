import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

// Lazily created so importing this module in scripts/build never opens a
// connection by itself. Tiny pool: shared hosting, one app process.
let cached: ReturnType<typeof createDb> | null = null

function createDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')
  const pool = mysql.createPool({ uri: url, connectionLimit: 2 })
  return drizzle(pool, { schema, mode: 'default' })
}

export function getDb() {
  if (!cached) cached = createDb()
  return cached
}
