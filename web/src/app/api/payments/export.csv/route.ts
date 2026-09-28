import { NextResponse } from 'next/server'
import { and, desc, eq, gte, lt } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, payments } from '@/db/schema'
import { apiSession } from '@/lib/auth/guard'

export const dynamic = 'force-dynamic'

// CSV export of the payments list (same filters as the Payments page).
export async function GET(request: Request) {
  const session = await apiSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const url = new URL(request.url)
  const status = url.searchParams.get('status') || ''
  const businessId = Number(url.searchParams.get('business') || 0)
  const month = url.searchParams.get('month') || '' // YYYY-MM

  const conditions = []
  if (status) conditions.push(eq(payments.status, status))
  if (businessId) conditions.push(eq(payments.businessId, businessId))
  if (month) {
    conditions.push(gte(payments.dueDate, `${month}-01`))
    conditions.push(lt(payments.dueDate, `${month}-32`))
  }

  const db = getDb()
  const rows = await db
    .select({
      business: businesses.name,
      slug: businesses.slug,
      reference: payments.reference,
      periodStart: payments.periodStart,
      periodEnd: payments.periodEnd,
      dueDate: payments.dueDate,
      amount: payments.amountPence,
      status: payments.status,
      paidAt: payments.paidAt,
      method: payments.paidMethod,
    })
    .from(payments)
    .innerJoin(businesses, eq(businesses.id, payments.businessId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(payments.dueDate))
    .limit(5000)

  const esc = (v: unknown) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const header = 'business,slug,reference,period_start,period_end,due_date,amount_gbp,status,paid_at,method'
  const lines = rows.map((r) =>
    [
      esc(r.business), esc(r.slug), esc(r.reference), r.periodStart, r.periodEnd, r.dueDate,
      (r.amount / 100).toFixed(2), r.status, r.paidAt ?? '', r.method ?? '',
    ].join(','),
  )
  const csv = [header, ...lines].join('\n') + '\n'

  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="pykk-payments${month ? `-${month}` : ''}.csv"`,
    },
  })
}
