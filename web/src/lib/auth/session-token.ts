import { randomBytes, createHash } from 'node:crypto'

export const SESSION_DAYS = 30
export const SESSION_COOKIE = 'pykk_admin'

// The cookie value: 32 random bytes, URL-safe. Only its SHA-256 hash is stored.
export function generateToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function sessionExpiry(now: Date = new Date()): Date {
  return new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000)
}
