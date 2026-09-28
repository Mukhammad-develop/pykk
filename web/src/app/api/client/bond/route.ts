import { NextResponse } from 'next/server'
import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { payments } from '@/db/schema'
import { getClientAuth } from '@/lib/auth/client'
import { corsPreflight, withCors } from '@/lib/cors'
import { clientPayUrl } from '@/lib/pay-url'
import { nextDueOnOrAfter, todayLondon } from '@/lib/billing'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request: Request) {
  return corsPreflight(request)
}

// The client's Bond section: price, next due, bills with pay links, and the
// plain-English bond explanation.
export async function GET(request: Request) {
  const auth = await getClientAuth(request)
  if (!auth) {
    return withCors(request, NextResponse.json({ error: 'Unauthorised' }, { status: 401 }))
  }
  const { business } = auth
  const db = getDb()
  const bills = await db
    .select({
      reference: payments.reference,
      dueDate: payments.dueDate,
      amountPence: payments.amountPence,
      status: payments.status,
      clientToken: payments.clientToken,
      paymentLinkUrl: payments.paymentLinkUrl,
    })
    .from(payments)
    .where(eq(payments.businessId, business.id))
    .orderBy(asc(payments.dueDate))
    .limit(24)

  const open = bills.filter((b) => ['scheduled', 'link_ready', 'overdue'].includes(b.status))

  return withCors(
    request,
    NextResponse.json({
      business: { name: business.name, slug: business.slug },
      pricePence: business.pricePence,
      nextDueDate: business.billingAnchorDate
        ? nextDueOnOrAfter(business.billingAnchorDate, todayLondon())
        : null,
      bills: bills.map((b) => ({
        reference: b.reference,
        dueDate: b.dueDate,
        amountPence: b.amountPence,
        status: b.status,
        payUrl: ['scheduled', 'link_ready', 'overdue'].includes(b.status)
          ? clientPayUrl(b.reference, b.clientToken)
          : null,
      })),
      openCount: open.length,
    }),
  )
}
