import { describe, expect, it } from 'vitest'
import { generateReference, uniqueReference, REFERENCE_ALPHABET } from './reference'

describe('generateReference', () => {
  it('is 6 chars from A–Z 0–9', () => {
    for (let i = 0; i < 100; i++) {
      const ref = generateReference()
      expect(ref).toHaveLength(6)
      for (const ch of ref) expect(REFERENCE_ALPHABET).toContain(ch)
    }
  })

  it('looks random enough to rarely repeat', () => {
    const refs = new Set(Array.from({ length: 1000 }, () => generateReference()))
    // 36^6 ≈ 2.2 billion possibilities — collisions in 1000 draws are vanishingly rare
    expect(refs.size).toBeGreaterThan(990)
  })
})

describe('uniqueReference', () => {
  it('returns the first non-taken reference', async () => {
    const taken = new Set(['AAAAAA'])
    const ref = await uniqueReference(async (r) => taken.has(r))
    expect(taken.has(ref)).toBe(false)
  })

  it('retries on collision until a free one appears', async () => {
    let calls = 0
    const ref = await uniqueReference(async () => {
      calls++
      return calls < 3 // first two "collide"
    })
    expect(calls).toBe(3)
    expect(ref).toHaveLength(6)
  })

  it('gives up after maxAttempts', async () => {
    await expect(uniqueReference(async () => true, 4)).rejects.toThrow(/unique payment reference/)
  })
})
