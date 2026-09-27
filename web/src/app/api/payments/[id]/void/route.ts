import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { payments } from '@/db/schema'
import { logActivity } from '@/lib/auth/activity'
import { loadPaymentForAction, readJson } from '@/lib/auth/action-guard'
import { clientIpFromHeaders } from '@/lib/request'

export const dynamic = 'force-dynamic'

// Void a bill (created by mistake) — needs a reason. Does not touch the business.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await loadPaymentForAction(request, Number(id))
  if (!guard.ok) return guard.response
  const { payment, session } = guard

  const body = await readJson(request)
  const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 500) : ''
  if (!reason) {
    return NextResponse.json({ error: 'A reason is needed to void a bill.' }, { status: 400 })
  }

  const db = getDb()
  await db.update(payments).set({ status: 'void', paidNote: reason }).where(eq(payments.id, payment.id))

  await logActivity({
    actor: session.email,
    action: 'payment.voided',
    entity: 'payment',
    entityId: payment.id,
    before: { status: payment.status },
    after: { status: 'void', reason },
    ip: clientIpFromHeaders(request.headers),
  })

  return NextResponse.json({ ok: true, status: 'void' })
}
