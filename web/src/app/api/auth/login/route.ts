import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { adminUsers } from '@/db/schema'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { checkLocked, clearAttempts, registerFailure } from '@/lib/auth/login-attempts'
import { logActivity } from '@/lib/auth/activity'
import { clientIpFromHeaders, originAllowed } from '@/lib/request'

export const dynamic = 'force-dynamic'

const GENERIC_ERROR = 'Invalid email or password.'

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
  }
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 })
  }

  const { email, password } = parsed.data
  const ip = clientIpFromHeaders(request.headers)

  // Rate limit: 5 failures per 15 minutes, per IP and per email.
  if ((await checkLocked('ip', ip ?? 'unknown')) || (await checkLocked('email', email))) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 })
  }

  const db = getDb()
  const users = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1)
  const user = users[0]
  const passwordOk = user ? await verifyPassword(user.passwordHash, password) : false

  if (!user || !passwordOk) {
    const emailResult = await registerFailure('email', email)
    const ipResult = await registerFailure('ip', ip ?? 'unknown')
    if (emailResult.justLocked || ipResult.justLocked) {
      await logActivity({ actor: 'system', action: 'auth.lockout', entity: 'admin_user', entityId: email, ip })
    }
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 401 })
  }

  await clearAttempts(email, ip)
  await createSession(user.id, ip, null)
  await logActivity({ actor: email, action: 'auth.login', entity: 'admin_user', entityId: email, ip })
  return NextResponse.json({ ok: true })
}
