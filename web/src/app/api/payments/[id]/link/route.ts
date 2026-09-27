import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { payments } from '@/db/schema'
import { logActivity } from '@/lib/auth/activity'
import { loadPaymentForAction, readJson } from '@/lib/auth/action-guard'
import { validatePaymentLink, appendStripeReference } from '@/lib/payment-link'
import { clientIpFromHeaders } from '@/lib/request'

export const dynamic = 'force-dynamic'

// Save (or replace) the pay link for a bill. Status becomes link_ready.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const guard = await loadPaymentForAction(request, Number(id))
  if (!guard.ok) return guard.response
  const { payment, business, session } = guard

  const body = await readJson(request)
  const rawUrl = typeof body?.url === 'string' ? body.url : ''
  const validated = validatePaymentLink(rawUrl)
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const appendRef = body?.appendReference !== false // default on
  const finalUrl = appendRef
    ? appendStripeReference(validated.url, payment.reference)
    : validated.url

  const before = { paymentLinkUrl: payment.paymentLinkUrl, status: payment.status }
  const db = getDb()
  await db
    .update(payments)
    .set({ paymentLinkUrl: finalUrl, linkAddedAt: new Date(), status: 'link_ready' })
    .where(eq(payments.id, payment.id))

  await logActivity({
    actor: session.email,
    action: 'payment.link_saved',
    entity: 'payment',
    entityId: payment.id,
    before,
    after: { paymentLinkUrl: finalUrl, status: 'link_ready' },
    ip: clientIpFromHeaders(request.headers),
  })

  return NextResponse.json({ ok: true, status: 'link_ready', paymentLinkUrl: finalUrl, businessName: business.name })
}
