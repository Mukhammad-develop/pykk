import { desc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/db'
import { businesses, payments } from '@/db/schema'
import { nextDueOnOrAfter, todayLondon } from '@/lib/billing'
import { formatLongDate, formatMoneyPence } from '@/lib/format'
import { LogoutButton } from './logout-button'
import { RunJobButton } from './run-job-button'

export const dynamic = 'force-dynamic'

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'text-sky-300 border-sky-800 bg-sky-950',
  link_ready: 'text-amber-300 border-amber-800 bg-amber-950',
  paid: 'text-emerald-300 border-emerald-800 bg-emerald-950',
  overdue: 'text-red-300 border-red-800 bg-red-950',
  waived: 'text-slate-300 border-slate-700 bg-slate-900',
  void: 'text-slate-500 border-slate-800 bg-slate-950',
}

export default async function AdminHome() {
  const session = await getSession()
  if (!session) redirect('/login')

  const db = getDb()
  const today = todayLondon()
  const allBusinesses = await db.select().from(businesses).orderBy(businesses.name)
  const recentPayments = await db
    .select({
      id: payments.id,
      reference: payments.reference,
      dueDate: payments.dueDate,
      amountPence: payments.amountPence,
      status: payments.status,
      businessName: businesses.name,
      businessSlug: businesses.slug,
    })
    .from(payments)
    .innerJoin(businesses, eq(businesses.id, payments.businessId))
    .orderBy(desc(payments.createdAt))
    .limit(10)

  const version = process.env.APP_VERSION ?? 'dev'

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-8">
      <header className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          PYKK Admin
        </p>
        <LogoutButton />
      </header>

      <section className="mt-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-100">Businesses</h1>
        <a
          href="/businesses/new"
          className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          + Add business
        </a>
      </section>

      {allBusinesses.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          No businesses yet. Add your first client — their first month is recorded
          as paid, and the daily job creates future bills automatically 7 days
          before they&apos;re due.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {allBusinesses.map((business) => (
            <li
              key={business.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-100">{business.name}</p>
                <p className="text-sm text-slate-300">{formatMoneyPence(business.pricePence)}/mo</p>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {business.slug}.pykk.uk · {business.status}
                {business.billingAnchorDate && (
                  <>
                    {' '}· next bill{' '}
                    {formatLongDate(nextDueOnOrAfter(
                      // next unpaid due date: today or later
                      business.billingAnchorDate,
                      today,
                    ))}
                  </>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-100">Latest payments</h2>
          <RunJobButton />
        </div>
        {recentPayments.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No payments yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {recentPayments.map((payment) => (
              <li
                key={payment.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm"
              >
                <span className="text-slate-200">
                  {payment.businessName}{' '}
                  <span className="text-slate-500">#{payment.reference}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-slate-400">{formatLongDate(payment.dueDate)}</span>
                  <span className="text-slate-200">{formatMoneyPence(payment.amountPence)}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[payment.status] ?? 'text-slate-300 border-slate-700'}`}
                  >
                    {payment.status.replace('_', ' ')}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-auto pt-10 text-center text-xs text-slate-600">
        Version {version} · <a className="text-sky-400" href="/healthz">/healthz</a>
      </p>
    </main>
  )
}
