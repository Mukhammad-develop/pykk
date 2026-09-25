import type { NextConfig } from 'next'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const nextConfig: NextConfig = {
  // Produces .next/standalone — a self-contained server the cPanel host can run
  // without building anything on the server.
  output: 'standalone',
  // Pin file tracing to this folder so the repo-root tooling lockfile doesn't
  // turn the standalone output into a nested monorepo layout.
  outputFileTracingRoot: dirname(fileURLToPath(import.meta.url)),
  // Keep these as real packages in the standalone node_modules instead of
  // inlining them into Next's server chunks — the bundled server scripts
  // (migrate.mjs, create-admin.mjs) need to require() them at runtime.
  serverExternalPackages: ['mysql2', 'drizzle-orm', 'zod'],
  // The app only imports drizzle-orm's main entry, but migrate.mjs also needs
  // drizzle-orm/mysql2/migrator — ship the whole package in the release.
  outputFileTracingIncludes: {
    '/**': ['./node_modules/drizzle-orm/**'],
  },
  poweredByHeader: false,
}

export default nextConfig
