import Link from 'next/link'
import { and, desc, eq, gte, like, lt, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, payments, PAYMENT_STATUSES } from '@/db/schema'
import { formatLongDate, formatMoneyPence } from '@/lib/format'

export const dynamic = 'force-dynamic'

const BADGE: Record<string, string> = {
  scheduled: 'text-sky-300 border-sky-800',
  link_ready: 'text-amber-300 border-amber-800',
  paid: 'text-emerald-300 border-emerald-800',
  overdue: 'text-red-300 border-red-800',
  waived: 'text-slate-300 border-slate-700',
  void: 'text-slate-500 border-slate-800',
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const status = params.status ?? ''
  const businessId = Number(params.business ?? 0)
  const month = params.month ?? ''
  const ref = (params.ref ?? '').trim().toUpperCase()

  const conditions = []
  if (status) conditions.push(eq(payments.status, status))
  if (businessId) conditions.push(eq(payments.businessId, businessId))
  if (month) {
    conditions.push(gte(payments.dueDate, `${month}-01`))
    conditions.push(lt(payments.dueDate, `${month}-32`))
  }
  if (ref) conditions.push(like(payments.reference, `%${ref}%`))

  const db = getDb()
  const [allBusinesses, rows, totals] = await Promise.all([
    db.select({ id: businesses.id, name: businesses.name }).from(businesses).orderBy(businesses.name),
    db
      .select({
        id: payments.id,
        reference: payments.reference,
        dueDate: payments.dueDate,
        amountPence: payments.amountPence,
        status: payments.status,
        paidAt: payments.paidAt,
        paidMethod: payments.paidMethod,
        businessId: businesses.id,
        businessName: businesses.name,
      })
      .from(payments)
      .innerJoin(businesses, eq(businesses.id, payments.businessId))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(payments.dueDate))
      .limit(200),
    db
      .select({ count: sql<number>`count(*)`, total: sql<number>`coalesce(sum(${payments.amountPence}), 0)` })
      .from(payments)
      .where(conditions.length ? and(...conditions) : undefined),
  ])

  const query = new URLSearchParams()
  if (status) query.set('status', status)
  if (businessId) query.set('business', String(businessId))
  if (month) query.set('month', month)
  if (ref) query.set('ref', ref)

  const input =
    'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500'

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Payments</h1>
        <a
          href={`/api/payments/export.csv?${query.toString()}`}
          className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500"
        >
          Export CSV
        </a>
      </div>

      <form className="mt-4 flex flex-wrap items-center gap-2" method="get">
        <select name="status" defaultValue={status} className={input}>
          <option value="">All statuses</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
        <select name="business" defaultValue={String(businessId || '')} className={input}>
          <option value="">All businesses</option>
          {allBusinesses.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <input type="month" name="month" defaultValue={month} className={input} />
        <input name="ref" placeholder="#reference" defaultValue={ref} className={`${input} w-28`} />
        <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950">
          Filter
        </button>
      </form>

      <p className="mt-3 text-xs text-slate-500">
        {totals[0].count} payment(s) · {formatMoneyPence(Number(totals[0].total))} total
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {rows.length === 0 && <p className="text-sm text-slate-500">Nothing matches those filters.</p>}
        {rows.map((payment) => (
          <li key={payment.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm">
            <span className="min-w-0">
              <Link href={`/businesses/${payment.businessId}`} className="font-medium text-slate-100 hover:text-emerald-400">
                {payment.businessName}
              </Link>{' '}
              <span className="text-slate-500">#{payment.reference}</span>
              <span className="block text-xs text-slate-400">
                due {formatLongDate(payment.dueDate)}
                {payment.paidAt ? ` · paid ${formatLongDate(payment.paidAt)}${payment.paidMethod ? ` (${payment.paidMethod.replace(/_/g, ' ')})` : ''}` : ''}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="text-slate-100">{formatMoneyPence(payment.amountPence)}</span>
              <span className={`rounded-full border px-2 py-0.5 text-xs ${BADGE[payment.status] ?? ''}`}>
                {payment.status.replace('_', ' ')}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
