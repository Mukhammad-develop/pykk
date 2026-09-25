import { and, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { loginAttempts } from '@/db/schema'
import { isLocked, nextAttemptState, type AttemptState } from './rate-limit'

type Kind = 'ip' | 'email'

async function readState(kind: Kind, value: string): Promise<AttemptState | null> {
  const db = getDb()
  const rows = await db
    .select()
    .from(loginAttempts)
    .where(and(eq(loginAttempts.kind, kind), eq(loginAttempts.value, value)))
    .limit(1)
  const row = rows[0]
  if (!row) return null
  return {
    failures: row.failures,
    windowStartedAt: row.windowStartedAt,
    lockedUntil: row.lockedUntil,
  }
}

export async function checkLocked(kind: Kind, value: string): Promise<boolean> {
  const state = await readState(kind, value)
  return state ? isLocked(state, new Date()) : false
}

export async function registerFailure(kind: Kind, value: string): Promise<{ justLocked: boolean }> {
  const db = getDb()
  const existing = await readState(kind, value)
  const { state, justLocked } = nextAttemptState(existing, new Date())

  if (existing) {
    await db
      .update(loginAttempts)
      .set(state)
      .where(and(eq(loginAttempts.kind, kind), eq(loginAttempts.value, value)))
  } else {
    await db.insert(loginAttempts).values({ kind, value, ...state })
  }
  return { justLocked }
}

export async function clearAttempts(email: string, ip: string | null): Promise<void> {
  const db = getDb()
  await db.delete(loginAttempts).where(and(eq(loginAttempts.kind, 'email'), eq(loginAttempts.value, email)))
  if (ip) {
    await db.delete(loginAttempts).where(and(eq(loginAttempts.kind, 'ip'), eq(loginAttempts.value, ip)))
  }
}
