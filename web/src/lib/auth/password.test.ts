import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password hashing (argon2id)', () => {
  it('verifies the right password and rejects the wrong one', async () => {
    const hash = await hashPassword('correct horse battery staple')

    expect(hash.startsWith('$argon2id$')).toBe(true)
    expect(await verifyPassword(hash, 'correct horse battery staple')).toBe(true)
    expect(await verifyPassword(hash, 'wrong password')).toBe(false)
  })

  it('produces a different hash each time (salted)', async () => {
    const a = await hashPassword('same password here')
    const b = await hashPassword('same password here')
    expect(a).not.toBe(b)
  })

  it('never throws on a malformed hash', async () => {
    expect(await verifyPassword('not-a-real-hash', 'whatever')).toBe(false)
  })
})
