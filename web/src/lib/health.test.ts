import { describe, expect, it } from 'vitest'
import { healthPayload } from './health'

describe('healthPayload', () => {
  it('reports ok with the pykk service name and given version', () => {
    const payload = healthPayload('abc1234')

    expect(payload.ok).toBe(true)
    expect(payload.service).toBe('pykk')
    expect(payload.version).toBe('abc1234')
    expect(Number.isNaN(Date.parse(payload.time))).toBe(false)
  })

  it("falls back to 'dev' when no version is set", () => {
    delete process.env.APP_VERSION

    expect(healthPayload().version).toBe('dev')
  })
})
