import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createHash, timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, payments } from '@/db/schema'
import { formatLongDate, formatMoneyPence } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your PYKK payment',
  robots: { index: false, follow: false },
}

// Constant-time token check (hashed so length never leaks).
function tokensMatch(provided: string | undefined, stored: string): boolean {
  if (!provided) return false
  const a = createHash('sha256').update(provided).digest()
  const b = createHash('sha256').update(stored).digest()
  return timingSafeEqual(a, b)
}

// The client's pay page: /pay/{reference}?t={client_token}
// No login. Shows only the business name, the bill, and a Pay now button.
export default async function PayPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>
  searchParams: Promise<{ t?: string }>
}) {
  const { reference } = await params
  const { t } = await searchParams

  const db = getDb()
  const rows = await db
    .select({ payment: payments, business: businesses })
    .from(payments)
    .innerJoin(businesses, eq(businesses.id, payments.businessId))
    .where(eq(payments.reference, reference.toUpperCase()))
    .limit(1)
  const row = rows[0]

  // A wrong or missing token, or a voided bill, shows a plain 404 — nothing else.
  if (!row || row.payment.status === 'void' || !tokensMatch(t, row.payment.clientToken)) {
    notFound()
  }
  const { payment, business } = row

  const paid = payment.status === 'paid'
  const waived = payment.status === 'waived'
  const hasLink = Boolean(payment.paymentLinkUrl)

  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">PYKK</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-100">{business.name}</h1>
        <p className="mt-1 text-sm text-slate-400">Payment #{payment.reference}</p>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-4xl font-bold text-slate-100">{formatMoneyPence(payment.amountPence)}</p>
          <p className="mt-2 text-sm text-slate-400">
            {formatLongDate(payment.periodStart)} – {formatLongDate(payment.periodEnd)}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            due {formatLongDate(payment.dueDate)}
            {payment.status === 'overdue' && (
              <span className="ml-1 font-medium text-red-400">(overdue)</span>
            )}
          </p>
        </div>

        {paid && (
          <p className="mt-6 rounded-xl border border-emerald-900 bg-emerald-950 px-4 py-3 text-sm text-emerald-300">
            Paid{payment.paidAt ? ` on ${formatLongDate(payment.paidAt)}` : ''} — thank you.
          </p>
        )}
        {waived && (
          <p className="mt-6 rounded-xl border border-emerald-900 bg-emerald-950 px-4 py-3 text-sm text-emerald-300">
            This month is on us — thank you.
          </p>
        )}
        {!paid && !waived && hasLink && (
          <a
            href={payment.paymentLinkUrl!}
            className="mt-6 block w-full rounded-xl bg-emerald-500 px-4 py-4 text-lg font-bold text-slate-950 transition hover:bg-emerald-400"
          >
            Pay now
          </a>
        )}
        {!paid && !waived && !hasLink && (
          <p className="mt-6 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-400">
            Your payment link will appear here soon.
          </p>
        )}
      </div>
    </main>
  )
}
