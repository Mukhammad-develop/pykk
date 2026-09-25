// Host-based routing decisions, pure and unit-tested. Used by middleware.ts.
//
// Production hosts:  admin.<ROOT_DOMAIN> (admin panel), app.<ROOT_DOMAIN> (public)
// Local dev hosts:   admin.localhost, app.localhost, localhost (→ admin)
//
// This server can only attach ONE URL to the Node app, so the fallback is live:
// PUBLIC_APP_HOST = admin.pykk.uk, and the public paths must also work on the
// admin host. /healthz works on every known host (update.sh depends on it).

export type HostKind = 'admin' | 'app' | 'unknown'

export const PUBLIC_PATH_PREFIXES = ['/pay/', '/api/pv']
export const PUBLIC_EXACT_PATHS = ['/pv.js']
export const HEALTH_PATH = '/healthz'

export function classifyHost(hostHeader: string | null, rootDomain: string): HostKind {
  if (!hostHeader) return 'unknown'
  const host = hostHeader.toLowerCase().split(':')[0]
  const root = rootDomain.toLowerCase().split(':')[0]

  if (host === `admin.${root}` || host === 'admin.localhost') return 'admin'
  if (host === `app.${root}` || host === 'app.localhost') return 'app'
  // bare localhost is a dev convenience → admin
  if (host === 'localhost' || host === '127.0.0.1') return 'admin'
  return 'unknown'
}

export function isHealthPath(pathname: string): boolean {
  return pathname === HEALTH_PATH
}

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.includes(pathname)) return true
  return PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

// The fallback is active when the public host is the admin host (i.e. the
// second domain couldn't be attached to the app on this server).
export function fallbackActive(publicAppHost: string, rootDomain: string): boolean {
  const pub = publicAppHost.toLowerCase().split(':')[0]
  const root = rootDomain.toLowerCase().split(':')[0]
  return pub === `admin.${root}` || pub === 'admin.localhost'
}

// Can this path be served at all on this host?
export function pathAllowedOnHost(
  kind: HostKind,
  pathname: string,
  fallback: boolean,
): boolean {
  if (kind === 'unknown') return false
  if (isHealthPath(pathname)) return true
  if (isPublicPath(pathname)) {
    if (kind === 'app') return true
    return fallback // admin host only serves public paths in fallback mode
  }
  // everything else is an admin path
  return kind === 'admin'
}

// The IP allowlist may guard admin paths, but must never block the public
// ones (clients pay there) or /healthz.
export function allowlistAppliesTo(pathname: string): boolean {
  return !isHealthPath(pathname) && !isPublicPath(pathname)
}

export function ipAllowed(clientIp: string | null, allowlist: string): boolean {
  const allowed = allowlist
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (allowed.length === 0) return true
  if (!clientIp) return false
  return allowed.includes(clientIp)
}
