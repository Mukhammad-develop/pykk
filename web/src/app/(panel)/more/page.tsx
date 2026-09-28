import { desc, like } from 'drizzle-orm'
import { getDb } from '@/db'
import { activityLog } from '@/db/schema'
import { getSession } from '@/lib/auth/session'
import { getSetting } from '@/lib/settings'
import { SettingsForm, LogoutAllButton } from './settings-form'

export const dynamic = 'force-dynamic'

export default async function MorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const session = await getSession()
  const params = await searchParams
  const filter = (params.q ?? '').trim()

  const db = getDb()
  const [leadDays, graceDays, defaultPrice, template, entries] = await Promise.all([
    getSetting('lead_days'),
    getSetting('grace_days'),
    getSetting('default_price_pence'),
    getSetting('client_message_template'),
    db
      .select()
      .from(activityLog)
      .where(filter ? like(activityLog.action, `%${filter}%`) : undefined)
      .orderBy(desc(activityLog.at))
      .limit(50),
  ])

  const input =
    'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500'

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-100">More</h1>

      <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-200">Settings</h2>
        <SettingsForm
          values={{
            leadDays: leadDays,
            graceDays: graceDays,
            defaultPricePence: defaultPrice,
            clientMessageTemplate: template,
          }}
        />
      </section>

      <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-slate-200">Account</h2>
        <p className="mt-1 text-sm text-slate-400">Signed in as {session?.email}</p>
        <p className="mt-1 text-xs text-slate-500">
          Two-factor authentication: not connected yet. Daily summary (Telegram/email): not configured.
        </p>
        <div className="mt-3">
          <LogoutAllButton />
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-slate-200">Activity log</h2>
        <form method="get" className="mt-2 flex gap-2">
          <input name="q" defaultValue={filter} placeholder="filter by action (e.g. payment, login, business)" className={`${input} flex-1`} />
          <button type="submit" className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950">
            Filter
          </button>
        </form>
        <ul className="mt-3 flex flex-col gap-1.5 text-xs">
          {entries.length === 0 && <p className="text-slate-500">Nothing logged yet.</p>}
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-baseline justify-between gap-2 border-b border-slate-800/60 pb-1.5">
              <span className="min-w-0 text-slate-300">
                <span className="text-slate-500">{entry.actor}</span>{' '}
                <span className="text-emerald-400">{entry.action}</span>
                {entry.entity ? <span className="text-slate-500"> · {entry.entity}{entry.entityId ? ` #${entry.entityId}` : ''}</span> : null}
              </span>
              <span className="shrink-0 text-slate-500">
                {entry.at.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
