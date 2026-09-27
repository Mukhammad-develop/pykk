import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { payments } from '@/db/schema'
import { logActivity } from '@/lib/auth/activity'
import { loadPaymentForAction } from '@/lib/auth/action-guard'
import { clientIpFromHeaders } from '@/lib/request'
import { UNDO_WINDOW_MS } from '../mark-paid/route'

export const dynamic = 'force-dynamic'

// Undo "Mark paid" — only inside the 10-minute window.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await loadPaymentForAction(request, Number(id))
  if (!guard.ok) return guard.response
  const { payment, session } = guard

  if (payment.status !== 'paid' || !payment.paidRecordedAt) {
    return NextResponse.json({ error: 'Nothing to undo.' }, { status: 400 })
  }
  const elapsed = Date.now() - payment.paidRecordedAt.getTime()
  if (elapsed > UNDO_WINDOW_MS) {
    return NextResponse.json({ error: 'The 10-minute undo window has passed.' }, { status: 400 })
  }

  const backTo = payment.paymentLinkUrl ? 'link_ready' : 'scheduled'
  const db = getDb()
  await db
    .update(payments)
    .set({ status: backTo, paidAt: null, paidMethod: null, paidNote: null, paidRecordedAt: null })
    .where(eq(payments.id, payment.id))

  await logActivity({
    actor: session.email,
    action: 'payment.paid_undone',
    entity: 'payment',
    entityId: payment.id,
    before: { status: 'paid' },
    after: { status: backTo },
    ip: clientIpFromHeaders(request.headers),
  })

  return NextResponse.json({ ok: true, status: backTo })
}
