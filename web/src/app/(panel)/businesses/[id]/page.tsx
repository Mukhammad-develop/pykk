import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/db'
import { businesses, payments } from '@/db/schema'
import { formatLongDate, formatMoneyPence } from '@/lib/format'
import { nextDueOnOrAfter, todayLondon } from '@/lib/billing'
import { isSiteSuspended, sitesDir } from '@/lib/site-control'
import fs from 'node:fs'
import { StatusActions } from './status-actions'
import { PriceNotesForm } from './price-notes-form'

export const dynamic = 'force-dynamic'

const PAYMENT_BADGE: Record<string, string> = {
  scheduled: 'text-sky-300 border-sky-800',
  link_ready: 'text-amber-300 border-amber-800',
  paid: 'text-emerald-300 border-emerald-800',
  overdue: 'text-red-300 border-red-800',
  waived: 'text-slate-300 border-slate-700',
  void: 'text-slate-500 border-slate-800',
}

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const db = getDb()
  const rows = await db.select().from(businesses).where(eq(businesses.id, Number(id))).limit(1)
  const business = rows[0]
  if (!business) notFound()

  const history = await db
    .select()
    .from(payments)
    .where(eq(payments.businessId, business.id))
    .orderBy(desc(payments.dueDate))
    .limit(24)

  const today = todayLondon()
  const siteExists = fs.existsSync(`${sitesDir()}/${business.slug}/index.html`)
  const suspended = isSiteSuspended(business.slug)
  const lifetimePence = history
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amountPence, 0)

  return (
    <div>
      <Link href="/businesses" className="text-sm text-slate-400 hover:text-slate-200">← Businesses</Link>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{business.name}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {business.type.replace(/_/g, ' ')}{business.town ? ` · ${business.town}` : ''} ·{' '}
            {siteExists ? (
              <a href={`https://${business.slug}.pykk.uk`} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                {business.slug}.pykk.uk ↗
              </a>
            ) : (
              <span className="text-slate-500">{business.slug}.pykk.uk (no site files yet)</span>
            )}
            {suspended && <span className="ml-2 text-red-400">site is OFF</span>}
          </p>
        </div>
        <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-300">
          {business.status}
        </span>
      </div>

      <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusActions businessId={business.id} status={business.status} />
          <Link
            href={`/businesses/${business.id}/website`}
            className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-500"
          >
            Website factory →
          </Link>
        </div>
        {business.websiteStatus !== 'none' && (
          <p className="mt-2 text-xs text-slate-500">
            Website: {business.websiteStatus === 'building' ? '🔨 building…' : business.websiteStatus === 'live' || business.websiteStatus === 'live_fallback' ? '✅ live' : business.websiteStatus}
            {business.websiteNote ? ` — ${business.websiteNote}` : ''}
          </p>
        )}
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-400">Next bill</p>
          <p className="mt-1 font-semibold text-slate-100">
            {business.billingAnchorDate
              ? formatLongDate(nextDueOnOrAfter(business.billingAnchorDate, today))
              : '—'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            grace: {business.graceDays ?? 7} days · anchor {business.billingAnchorDate ?? '—'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs text-slate-400">Lifetime value</p>
          <p className="mt-1 font-semibold text-slate-100">{formatMoneyPence(lifetimePence)}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            since {business.startedAt ?? '—'}
          </p>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-slate-200">Contact</h2>
        <p className="mt-1 text-sm text-slate-400">
          {business.ownerName ?? '—'}
          {business.ownerPhone ? ` · ${business.ownerPhone}` : ''}
          {business.ownerEmail ? ` · ${business.ownerEmail}` : ''}
        </p>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-200">Price & notes</h2>
        <PriceNotesForm businessId={business.id} pricePence={business.pricePence} notes={business.notes} />
      </section>

      <section className="mt-4">
        <h2 className="text-sm font-semibold text-slate-200">Payment history</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No payments yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {history.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm">
                <span className="text-slate-300">
                  <span className="text-slate-500">#{payment.reference}</span> {formatLongDate(payment.dueDate)}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-slate-200">{formatMoneyPence(payment.amountPence)}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${PAYMENT_BADGE[payment.status] ?? ''}`}>
                    {payment.status.replace('_', ' ')}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">
        Bookings, texts, page views and enquiries: <span className="text-slate-400">not connected yet</span>.
      </section>
    </div>
  )
}
