import { NextResponse } from 'next/server'
import { apiSession } from '@/lib/auth/guard'
import { destroyAllSessions } from '@/lib/auth/session'
import { logActivity } from '@/lib/auth/activity'
import { originAllowed } from '@/lib/request'

export const dynamic = 'force-dynamic'

// "Log out all devices" — revokes every admin session, including this one.
export async function POST(request: Request) {
  if (!originAllowed(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const session = await apiSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  await destroyAllSessions(session.userId)
  await logActivity({ actor: session.email, action: 'auth.logout_all', entity: 'admin_user', entityId: session.email })
  return NextResponse.json({ ok: true })
}
