import { describe, expect, it } from 'vitest'
import { generateToken, hashToken, sessionExpiry, SESSION_DAYS } from './session-token'

describe('session tokens', () => {
  it('generates URL-safe tokens of 32 random bytes', () => {
    const token = generateToken()
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(token.length).toBeGreaterThanOrEqual(40)
    expect(generateToken()).not.toBe(token)
  })

  it('hashes deterministically to 64 hex chars (SHA-256)', () => {
    const hash = hashToken('abc')
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(hashToken('abc')).toBe(hash)
    expect(hashToken('abd')).not.toBe(hash)
  })

  it('expires 30 days from now', () => {
    const now = new Date('2026-10-02T06:00:00Z')
    const expiry = sessionExpiry(now)
    expect(expiry.getTime() - now.getTime()).toBe(SESSION_DAYS * 24 * 60 * 60 * 1000)
  })
})
