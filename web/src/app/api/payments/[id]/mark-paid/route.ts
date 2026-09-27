import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, payments, PAID_METHODS } from '@/db/schema'
import { logActivity } from '@/lib/auth/activity'
import { loadPaymentForAction, readJson } from '@/lib/auth/action-guard'
import { restoreSite } from '@/lib/site-control'
import { todayLondon } from '@/lib/billing'
import { clientIpFromHeaders } from '@/lib/request'

export const dynamic = 'force-dynamic'

export const UNDO_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

// Mark a bill paid. Also brings a suspended business (and its site) back.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await loadPaymentForAction(request, Number(id))
  if (!guard.ok) return guard.response
  const { payment, business, session } = guard

  const body = await readJson(request)
  const paidAtRaw = body?.paidAt
  const paidAt = typeof paidAtRaw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(paidAtRaw)
    ? paidAtRaw
    : todayLondon()
  const methodRaw = body?.method
  const method = PAID_METHODS.includes(methodRaw as (typeof PAID_METHODS)[number])
    ? (methodRaw as (typeof PAID_METHODS)[number])
    : 'link'
  const note = typeof body?.note === 'string' ? body.note.slice(0, 500) : null

  const db = getDb()
  const now = new Date()
  await db
    .update(payments)
    .set({
      status: 'paid',
      paidAt,
      paidMethod: method,
      paidNote: note,
      paidRecordedAt: now,
    })
    .where(eq(payments.id, payment.id))

  // Paying brings the business (and its site) back to life.
  let reactivated = false
  if (business.status === 'suspended') {
    await db.update(businesses).set({ status: 'active' }).where(eq(businesses.id, business.id))
    restoreSite(business.slug)
    reactivated = true
  }

  await logActivity({
    actor: session.email,
    action: 'payment.marked_paid',
    entity: 'payment',
    entityId: payment.id,
    before: { status: payment.status },
    after: { status: 'paid', paidAt, method, note, reactivated },
    ip: clientIpFromHeaders(request.headers),
  })

  return NextResponse.json({
    ok: true,
    status: 'paid',
    reactivated,
    undoUntil: new Date(now.getTime() + UNDO_WINDOW_MS).toISOString(),
  })
}
