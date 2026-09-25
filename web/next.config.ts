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
  poweredByHeader: false,
}

export default nextConfig
