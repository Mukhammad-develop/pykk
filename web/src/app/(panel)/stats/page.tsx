import { and, eq, gte, inArray, lt, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, costs, payments } from '@/db/schema'
import { addDays, todayLondon } from '@/lib/billing'
import { formatMoneyPence } from '@/lib/format'
import { CostsEditor } from './costs-editor'

export const dynamic = 'force-dynamic'

function Card({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${tone ?? 'border-slate-800 bg-slate-900'}`}>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-100">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export default async function StatsPage() {
  const db = getDb()
  const today = todayLondon()
  const monthStart = `${today.slice(0, 8)}01`
  const month = today.slice(0, 7)
  const in30 = addDays(today, 30)

  const [mrrRow, collectedRow, outstandingRow, overdueRow, expectedRow, lifetimeRow, costsRows, statusRows, newClientsRow] =
    await Promise.all([
      db.select({ total: sql<number>`coalesce(sum(${businesses.pricePence}), 0)`, count: sql<number>`count(*)` }).from(businesses).where(eq(businesses.status, 'active')),
      db.select({ total: sql<number>`coalesce(sum(${payments.amountPence}), 0)` }).from(payments).where(and(eq(payments.status, 'paid'), gte(payments.paidAt, monthStart))),
      db.select({ total: sql<number>`coalesce(sum(${payments.amountPence}), 0)`, count: sql<number>`count(*)` }).from(payments).where(inArray(payments.status, ['scheduled', 'link_ready'])),
      db.select({ total: sql<number>`coalesce(sum(${payments.amountPence}), 0)`, count: sql<number>`count(*)` }).from(payments).where(eq(payments.status, 'overdue')),
      db.select({ total: sql<number>`coalesce(sum(${payments.amountPence}), 0)` }).from(payments).where(and(inArray(payments.status, ['scheduled', 'link_ready']), gte(payments.dueDate, today), lt(payments.dueDate, in30))),
      db.select({ total: sql<number>`coalesce(sum(${payments.amountPence}), 0)`, count: sql<number>`count(*)` }).from(payments).where(eq(payments.status, 'paid')),
      db.select().from(costs).where(eq(costs.month, month)).orderBy(costs.category),
      db.select({ status: businesses.status, count: sql<number>`count(*)` }).from(businesses).groupBy(businesses.status),
      db.select({ count: sql<number>`count(*)` }).from(businesses).where(gte(businesses.createdAt, new Date(`${monthStart}T00:00:00Z`))),
    ])

  const mrr = Number(mrrRow[0].total)
  const activeCount = Number(mrrRow[0].count)
  const collected = Number(collectedRow[0].total)
  const costsTotal = costsRows.reduce((sum, r) => sum + r.amountPence, 0)
  const lifetime = Number(lifetimeRow[0].total)
  const paidCount = Number(lifetimeRow[0].count)
  const byStatus = Object.fromEntries(statusRows.map((r) => [r.status, Number(r.count)]))

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-100">Stats</h1>

      <h2 className="mt-5 text-sm font-semibold text-slate-300">Money</h2>
      <section className="mt-2 grid grid-cols-2 gap-3">
        <Card label="MRR" value={formatMoneyPence(mrr)} hint={`${activeCount} active`} />
        <Card label="ARR" value={formatMoneyPence(mrr * 12)} />
        <Card label="Collected this month" value={formatMoneyPence(collected)} tone="border-emerald-900 bg-emerald-950/50" />
        <Card label="Outstanding" value={formatMoneyPence(Number(outstandingRow[0].total))} hint={`${Number(outstandingRow[0].count)} bills`} />
        <Card label="Overdue" value={formatMoneyPence(Number(overdueRow[0].total))} hint={`${Number(overdueRow[0].count)} bills`} tone={Number(overdueRow[0].count) > 0 ? 'border-red-900 bg-red-950/50' : undefined} />
        <Card label="Expected next 30 days" value={formatMoneyPence(Number(expectedRow[0].total))} />
        <Card label="Lifetime revenue" value={formatMoneyPence(lifetime)} hint={`${paidCount} payments`} />
        <Card
          label="Profit this month"
          value={formatMoneyPence(collected - costsTotal)}
          hint={`collected ${formatMoneyPence(collected)} − costs ${formatMoneyPence(costsTotal)}`}
          tone={collected - costsTotal >= 0 ? 'border-emerald-900 bg-emerald-950/50' : 'border-red-900 bg-red-950/50'}
        />
      </section>

      <h2 className="mt-6 text-sm font-semibold text-slate-300">Clients</h2>
      <section className="mt-2 grid grid-cols-2 gap-3">
        <Card label="Active" value={String(byStatus.active ?? 0)} />
        <Card label="New this month" value={String(Number(newClientsRow[0].count))} />
        <Card label="Paused" value={String(byStatus.paused ?? 0)} />
        <Card label="Suspended" value={String(byStatus.suspended ?? 0)} tone={(byStatus.suspended ?? 0) > 0 ? 'border-red-900 bg-red-950/50' : undefined} />
        <Card label="Cancelled" value={String(byStatus.cancelled ?? 0)} />
        <Card label="Preview / building / lead" value={String((byStatus.preview ?? 0) + (byStatus.building ?? 0) + (byStatus.lead ?? 0))} />
      </section>

      <h2 className="mt-6 text-sm font-semibold text-slate-300">
        Costs this month <span className="text-slate-500">({month})</span>
      </h2>
      <section className="mt-2 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <CostsEditor month={month} rows={costsRows} />
      </section>

      <h2 className="mt-6 text-sm font-semibold text-slate-300">Websites, bookings & texts</h2>
      <p className="mt-2 rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-500">
        Page-view charts, booking trends and SMS stats: <span className="text-slate-400">not connected yet</span>.
      </p>
    </div>
  )
}
