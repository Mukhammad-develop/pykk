import { NextResponse } from 'next/server'

// Cross-origin rules for the client area: the panel shell runs on
// {slug}.pykk.uk but talks to the API on the app host. Only pykk.uk
// subdomains may call in, and only with the methods/headers we use.

const ORIGIN_RE = /^https:\/\/[a-z0-9][a-z0-9-]{0,38}[a-z0-9]\.pykk\.uk$/
const LOCALHOST_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

export function clientOriginAllowed(origin: string | null, rootDomain = 'pykk.uk'): boolean {
  if (!origin) return true // non-browser clients (curl, same-origin)
  return ORIGIN_RE.test(origin) || origin === `https://admin.${rootDomain}` || LOCALHOST_RE.test(origin)
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'access-control-allow-methods': 'GET, POST, PUT, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-max-age': '86400',
    vary: 'origin',
  }
  if (origin && clientOriginAllowed(origin)) {
    headers['access-control-allow-origin'] = origin
  }
  return headers
}

// Every client API route answers OPTIONS for the preflight.
export function corsPreflight(request: Request): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) })
}

export function withCors(request: Request, response: NextResponse): NextResponse {
  const headers = corsHeaders(request.headers.get('origin'))
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value)
  }
  return response
}
