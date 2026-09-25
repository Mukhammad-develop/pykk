import { describe, expect, it } from 'vitest'
import {
  isLocked,
  nextAttemptState,
  windowExpired,
  RATE_LIMIT_MAX_FAILURES,
  RATE_LIMIT_WINDOW_MS,
} from './rate-limit'

const T0 = new Date('2026-10-02T06:00:00Z')
const plus = (ms: number) => new Date(T0.getTime() + ms)

describe('nextAttemptState', () => {
  it('starts a fresh window on the first failure', () => {
    const { state, justLocked } = nextAttemptState(null, T0)
    expect(state.failures).toBe(1)
    expect(state.windowStartedAt).toEqual(T0)
    expect(state.lockedUntil).toBeNull()
    expect(justLocked).toBe(false)
  })

  it('counts failures within the window and locks at the limit', () => {
    let state = nextAttemptState(null, T0).state
    let justLocked = false
    for (let i = 2; i <= RATE_LIMIT_MAX_FAILURES; i++) {
      ;({ state, justLocked } = nextAttemptState(state, plus(i * 1000)))
      expect(state.failures).toBe(i)
    }
    expect(justLocked).toBe(true)
    expect(isLocked(state, plus(RATE_LIMIT_MAX_FAILURES * 1000))).toBe(true)
    // locked until the end of the 15-minute window
    expect(state.lockedUntil).toEqual(new Date(T0.getTime() + RATE_LIMIT_WINDOW_MS))
  })

  it('does not lock before the limit', () => {
    let state = nextAttemptState(null, T0).state
    for (let i = 2; i <= RATE_LIMIT_MAX_FAILURES - 1; i++) {
      state = nextAttemptState(state, plus(i * 1000)).state
    }
    expect(state.lockedUntil).toBeNull()
    expect(isLocked(state, plus(60_000))).toBe(false)
  })

  it('resets after the window expires', () => {
    let state = nextAttemptState(null, T0).state
    state = nextAttemptState(state, plus(1000)).state
    const later = plus(RATE_LIMIT_WINDOW_MS + 1000)
    expect(windowExpired(state, later)).toBe(true)
    const fresh = nextAttemptState(state, later)
    expect(fresh.state.failures).toBe(1)
    expect(fresh.state.windowStartedAt).toEqual(later)
  })
})
