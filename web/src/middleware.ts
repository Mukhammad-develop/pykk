import { NextRequest, NextResponse } from 'next/server'
import {
  allowlistAppliesTo,
  classifyHost,
  fallbackActive,
  ipAllowed,
  pathAllowedOnHost,
} from '@/lib/host'

const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? 'pykk.uk'
const PUBLIC_APP_HOST = process.env.PUBLIC_APP_HOST ?? `app.${ROOT_DOMAIN}`
const ADMIN_IP_ALLOWLIST = process.env.ADMIN_IP_ALLOWLIST ?? ''

function clientIpFrom(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const kind = classifyHost(request.headers.get('host'), ROOT_DOMAIN)
  const fallback = fallbackActive(PUBLIC_APP_HOST, ROOT_DOMAIN)

  // Host/path gate: admin paths only on the admin host, public paths only on
  // the app host (plus the admin host in fallback mode), 404 otherwise.
  if (!pathAllowedOnHost(kind, pathname, fallback)) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Optional IP allowlist — admin paths only, never the public ones.
  if (
    kind === 'admin' &&
    allowlistAppliesTo(pathname) &&
    !ipAllowed(clientIpFrom(request), ADMIN_IP_ALLOWLIST)
  ) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const requestHeaders = new Headers(request.headers)
  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // Admin pages are private — keep them out of every search engine.
  response.headers.set('x-robots-tag', 'noindex, nofollow')

  // Strict CSP with a per-request nonce (production only — dev needs eval).
  // Next.js picks the nonce up from this header and applies it to its scripts.
  if (process.env.NODE_ENV === 'production') {
    const nonce = btoa(
      String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))),
    )
    requestHeaders.set('x-nonce', nonce)
    response.headers.set(
      'content-security-policy',
      [
        `default-src 'self'`,
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
        `style-src 'self' 'unsafe-inline'`,
        `img-src 'self' data:`,
        `font-src 'self' data:`,
        `connect-src 'self'`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `form-action 'self'`,
        `frame-ancestors 'none'`,
        `upgrade-insecure-requests`,
      ].join('; '),
    )
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
