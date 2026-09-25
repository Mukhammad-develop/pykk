import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { LogoutButton } from './logout-button'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  const session = await getSession()
  if (!session) redirect('/login')

  const version = process.env.APP_VERSION ?? 'dev'

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-8">
      <header className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          PYKK Admin
        </p>
        <LogoutButton />
      </header>

      <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-xl font-bold text-slate-100">You&apos;re in.</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Signed in as <span className="text-slate-200">{session.email}</span>.
          The foundation is laid: database, secure login, activity log and host
          routing are all live. The control-room screens (Today, Payments,
          Businesses, Stats) arrive in the next phases.
        </p>
      </section>

      <p className="mt-auto pt-10 text-center text-xs text-slate-600">
        Version {version} · <a className="text-sky-400" href="/healthz">/healthz</a>
      </p>
    </main>
  )
}
