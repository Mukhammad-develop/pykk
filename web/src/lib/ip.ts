import { headers } from 'next/headers'

// Passenger (and any proxy) puts the real client IP here; first entry wins.
export async function clientIp(): Promise<string | null> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return h.get('x-real-ip')
}
