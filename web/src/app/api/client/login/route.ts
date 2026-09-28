import { NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, clientUsers } from '@/db/schema'
import { verifyPassword } from '@/lib/auth/password'
import { createClientSession } from '@/lib/auth/client'
import { checkLocked, clearAttempts, registerFailure } from '@/lib/auth/login-attempts'
import { logActivity } from '@/lib/auth/activity'
import { clientIpFromHeaders } from '@/lib/request'
import { corsPreflight, withCors } from '@/lib/cors'

export const dynamic = 'force-dynamic'

const GENERIC_ERROR = 'Invalid email or password.'

const bodySchema = z.object({
  slug: z.string().trim().toLowerCase().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
})

export async function OPTIONS(request: Request) {
  return corsPreflight(request)
}

// Client-area login at {slug}.pykk.uk/admin. Returns a bearer token.
export async function POST(request: Request) {
  const fail = (status: number, error: string) => withCors(request, NextResponse.json({ error }, { status }))

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail(400, GENERIC_ERROR)
  }
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return fail(401, GENERIC_ERROR)
  const { slug, email, password } = parsed.data
  const ip = clientIpFromHeaders(request.headers)

  if ((await checkLocked('ip', ip ?? 'unknown')) || (await checkLocked('email', email))) {
    return fail(401, GENERIC_ERROR)
  }

  const db = getDb()
  const rows = await db
    .select({ clientUser: clientUsers, business: businesses })
    .from(clientUsers)
    .innerJoin(businesses, eq(businesses.id, clientUsers.businessId))
    .where(and(eq(clientUsers.email, email), eq(businesses.slug, slug), eq(clientUsers.active, 1)))
    .limit(1)
  const row = rows[0]
  const ok = row ? await verifyPassword(row.clientUser.passwordHash, password) : false

  if (!row || !ok) {
    const emailResult = await registerFailure('email', email)
    const ipResult = await registerFailure('ip', ip ?? 'unknown')
    if (emailResult.justLocked || ipResult.justLocked) {
      await logActivity({ actor: 'system', action: 'client.lockout', entity: 'client_user', entityId: email, ip })
    }
    return fail(401, GENERIC_ERROR)
  }

  await clearAttempts(email, ip)
  const token = await createClientSession(row.clientUser.id, ip, request.headers.get('user-agent'))
  await logActivity({
    actor: `client:${slug}`,
    action: 'client.login',
    entity: 'client_user',
    entityId: email,
    ip,
  })

  return withCors(
    request,
    NextResponse.json({
      token,
      business: { name: row.business.name, slug: row.business.slug, type: row.business.type },
    }),
  )
}
