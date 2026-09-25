import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Produces .next/standalone — a self-contained server the cPanel host can run
  // without building anything on the server.
  output: 'standalone',
  poweredByHeader: false,
}

export default nextConfig
