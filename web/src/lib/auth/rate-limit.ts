export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
export const RATE_LIMIT_MAX_FAILURES = 5

export interface AttemptState {
  failures: number
  windowStartedAt: Date
  lockedUntil: Date | null
}

export function isLocked(state: Pick<AttemptState, 'lockedUntil'>, now: Date): boolean {
  return state.lockedUntil !== null && state.lockedUntil.getTime() > now.getTime()
}

export function windowExpired(state: Pick<AttemptState, 'windowStartedAt'>, now: Date): boolean {
  return now.getTime() - state.windowStartedAt.getTime() > RATE_LIMIT_WINDOW_MS
}

// Pure decision: given the stored state and a new failure, what should the
// state become, and did this failure just trigger the lockout?
export function nextAttemptState(
  existing: AttemptState | null,
  now: Date,
): { state: AttemptState; justLocked: boolean } {
  if (!existing || windowExpired(existing, now)) {
    const windowStartedAt = now
    return {
      state: { failures: 1, windowStartedAt, lockedUntil: null },
      justLocked: false,
    }
  }
  const failures = existing.failures + 1
  const justLocked = failures >= RATE_LIMIT_MAX_FAILURES && !isLocked(existing, now)
  return {
    state: {
      failures,
      windowStartedAt: existing.windowStartedAt,
      lockedUntil: failures >= RATE_LIMIT_MAX_FAILURES
        ? new Date(existing.windowStartedAt.getTime() + RATE_LIMIT_WINDOW_MS)
        : null,
    },
    justLocked,
  }
}
