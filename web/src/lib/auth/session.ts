import { cookies } from 'next/headers'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { getDb } from '@/db'
import { adminSessions, adminUsers } from '@/db/schema'
import { generateToken, hashToken, sessionExpiry, SESSION_COOKIE } from './session-token'

export interface AdminSession {
  userId: number
  email: string
  sessionId: number
}

// Creates a DB session and returns the raw token to put in the cookie.
// Only callable from a server action / route handler (writes cookies).
export async function createSession(
  userId: number,
  ip: string | null,
  userAgent: string | null,
): Promise<void> {
  const token = generateToken()
  const expiresAt = sessionExpiry()
  const db = getDb()
  await db.insert(adminSessions).values({
    tokenHash: hashToken(token),
    userId,
    expiresAt,
    ip,
    userAgent: userAgent?.slice(0, 255) ?? null,
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    // host-only: no Domain attribute, so sibling subdomains never see it
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  const db = getDb()
  const rows = await db
    .select({
      sessionId: adminSessions.id,
      userId: adminSessions.userId,
      email: adminUsers.email,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminUsers.id, adminSessions.userId))
    .where(
      and(
        eq(adminSessions.tokenHash, hashToken(token)),
        isNull(adminSessions.revokedAt),
        gt(adminSessions.expiresAt, new Date()),
      ),
    )
    .limit(1)

  return rows[0] ?? null
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (token) {
    const db = getDb()
    await db
      .update(adminSessions)
      .set({ revokedAt: new Date() })
      .where(eq(adminSessions.tokenHash, hashToken(token)))
  }
  cookieStore.delete(SESSION_COOKIE)
}

// "Log out all devices" (used from Settings in a later phase).
export async function destroyAllSessions(userId: number): Promise<void> {
  const db = getDb()
  await db
    .update(adminSessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(adminSessions.userId, userId), isNull(adminSessions.revokedAt)))
}
