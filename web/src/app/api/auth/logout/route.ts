import { NextResponse } from 'next/server'
import { destroySession, getSession } from '@/lib/auth/session'
import { logActivity } from '@/lib/auth/activity'
import { originAllowed } from '@/lib/request'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const session = await getSession()
  await destroySession()
  if (session) {
    await logActivity({
      actor: session.email,
      action: 'auth.logout',
      entity: 'admin_user',
      entityId: session.email,
    })
  }
  return NextResponse.json({ ok: true })
}
