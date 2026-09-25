// Request helpers for route handlers (mutations use JSON route handlers — see
// DECISIONS.md: server-action multipart posts fail on this server's Node).

// The real client IP, from the proxy headers Passenger sets.
export function clientIpFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return headers.get('x-real-ip')
}

// Mutations only accept same-origin posts. Combined with the SameSite=Strict
// session cookie and JSON bodies (which cross-origin forms can't send), this
// is our CSRF protection.
export function originAllowed(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true // non-browser clients (curl, health checks)
  try {
    return new URL(origin).host === request.headers.get('host')
  } catch {
    return false
  }
}
