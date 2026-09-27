import Link from 'next/link'
import { getDb } from '@/db'
import { businesses } from '@/db/schema'
import { nextDueOnOrAfter, todayLondon } from '@/lib/billing'
import { formatLongDate, formatMoneyPence } from '@/lib/format'
import fs from 'node:fs'
import { sitesDir } from '@/lib/site-control'

export const dynamic = 'force-dynamic'

const STATUS_BADGE: Record<string, string> = {
  lead: 'text-slate-300 border-slate-700',
  building: 'text-sky-300 border-sky-800',
  preview: 'text-violet-300 border-violet-800',
  active: 'text-emerald-300 border-emerald-800',
  paused: 'text-amber-300 border-amber-800',
  suspended: 'text-red-300 border-red-800',
  cancelled: 'text-slate-500 border-slate-800',
}

export default async function BusinessesPage() {
  const db = getDb()
  const today = todayLondon()
  const rows = await db.select().from(businesses).orderBy(businesses.name)

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-100">Businesses</h1>
        <Link
          href="/businesses/new"
          className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
        >
          + Add business
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 text-sm text-slate-400">
          No businesses yet — add your first client.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((business) => {
            const siteExists = fs.existsSync(`${sitesDir()}/${business.slug}/index.html`)
            return (
              <li key={business.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/businesses/${business.id}`} className="font-semibold text-slate-100 hover:text-emerald-400">
                      {business.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {business.town ? `${business.town} · ` : ''}{business.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_BADGE[business.status] ?? ''}`}>
                    {business.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {siteExists ? (
                    <a href={`https://${business.slug}.pykk.uk`} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                      {business.slug}.pykk.uk ↗
                    </a>
                  ) : (
                    <span className="text-slate-500">{business.slug}.pykk.uk (no site files yet)</span>
                  )}
                  {' · '}{formatMoneyPence(business.pricePence)}/mo
                  {business.billingAnchorDate && (
                    <> · next bill {formatLongDate(nextDueOnOrAfter(business.billingAnchorDate, today))}</>
                  )}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
