'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { adminUsers } from '@/db/schema'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { checkLocked, clearAttempts, registerFailure } from '@/lib/auth/login-attempts'
import { logActivity } from '@/lib/auth/activity'
import { clientIp } from '@/lib/ip'

const GENERIC_ERROR = 'Invalid email or password.'

const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
})

export interface LoginFormState {
  error: string | null
}

export async function login(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) return { error: GENERIC_ERROR }

  const { email, password } = parsed.data
  const ip = await clientIp()

  // Rate limit: 5 failures per 15 minutes, per IP and per email.
  if ((await checkLocked('ip', ip ?? 'unknown')) || (await checkLocked('email', email))) {
    return { error: GENERIC_ERROR }
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
    return { error: GENERIC_ERROR }
  }

  await clearAttempts(email, ip)
  await createSession(user.id, ip, null)
  await logActivity({ actor: email, action: 'auth.login', entity: 'admin_user', entityId: email, ip })
  redirect('/')
}

export async function logout(): Promise<void> {
  const { destroySession } = await import('@/lib/auth/session')
  const { getSession } = await import('@/lib/auth/session')
  const session = await getSession()
  await destroySession()
  if (session) {
    await logActivity({ actor: session.email, action: 'auth.logout', entity: 'admin_user', entityId: session.email })
  }
  redirect('/login')
}
