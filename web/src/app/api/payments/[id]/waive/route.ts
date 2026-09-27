import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, payments } from '@/db/schema'
import { logActivity } from '@/lib/auth/activity'
import { loadPaymentForAction, readJson } from '@/lib/auth/action-guard'
import { restoreSite } from '@/lib/site-control'
import { clientIpFromHeaders } from '@/lib/request'

export const dynamic = 'force-dynamic'

// Waive a bill (free month) — needs a reason. Keeps/brings the business active.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await loadPaymentForAction(request, Number(id))
  if (!guard.ok) return guard.response
  const { payment, business, session } = guard

  const body = await readJson(request)
  const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 500) : ''
  if (!reason) {
    return NextResponse.json({ error: 'A reason is needed to waive a bill.' }, { status: 400 })
  }

  const db = getDb()
  await db.update(payments).set({ status: 'waived', paidNote: reason }).where(eq(payments.id, payment.id))

  let reactivated = false
  if (business.status === 'suspended') {
    await db.update(businesses).set({ status: 'active' }).where(eq(businesses.id, business.id))
    restoreSite(business.slug)
    reactivated = true
  }

  await logActivity({
    actor: session.email,
    action: 'payment.waived',
    entity: 'payment',
    entityId: payment.id,
    before: { status: payment.status },
    after: { status: 'waived', reason, reactivated },
    ip: clientIpFromHeaders(request.headers),
  })

  return NextResponse.json({ ok: true, status: 'waived', reactivated })
}
