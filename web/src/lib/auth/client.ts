import { randomBytes, createHash } from 'node:crypto'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, clientSessions, clientUsers } from '@/db/schema'

export const CLIENT_SESSION_DAYS = 30

export interface ClientAuth {
  business: typeof businesses.$inferSelect
  clientUser: typeof clientUsers.$inferSelect
}

export function clientSessionToken(): string {
  return randomBytes(32).toString('base64url')
}

export async function createClientSession(
  clientUserId: number,
  ip: string | null,
  userAgent: string | null,
): Promise<string> {
  const token = clientSessionToken()
  const db = getDb()
  await db.insert(clientSessions).values({
    tokenHash: createHash('sha256').update(token).digest('hex'),
    clientUserId,
    expiresAt: new Date(Date.now() + CLIENT_SESSION_DAYS * 24 * 60 * 60 * 1000),
    ip,
    userAgent: userAgent?.slice(0, 255) ?? null,
  })
  return token
}

// Every /api/client route starts here: bearer token → the one business it unlocks.
export async function getClientAuth(request: Request): Promise<ClientAuth | null> {
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) return null

  const db = getDb()
  const rows = await db
    .select({ business: businesses, clientUser: clientUsers })
    .from(clientSessions)
    .innerJoin(clientUsers, eq(clientUsers.id, clientSessions.clientUserId))
    .innerJoin(businesses, eq(businesses.id, clientUsers.businessId))
    .where(
      and(
        eq(clientSessions.tokenHash, createHash('sha256').update(token).digest('hex')),
        isNull(clientSessions.revokedAt),
        gt(clientSessions.expiresAt, new Date()),
        eq(clientUsers.active, 1),
      ),
    )
    .limit(1)

  return rows[0] ?? null
}

export async function destroyClientSession(request: Request): Promise<void> {
  const header = request.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) return
  const db = getDb()
  await db
    .update(clientSessions)
    .set({ revokedAt: new Date() })
    .where(eq(clientSessions.tokenHash, createHash('sha256').update(token).digest('hex')))
}
