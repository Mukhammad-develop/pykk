import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { LoginForm } from './form'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Sign in — PYKK Admin',
}

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect('/')

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          PYKK Admin
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-100">Sign in</h1>
        <p className="mt-1 text-sm text-slate-400">
          Tech for every business — your private control room.
        </p>
        <LoginForm />
      </div>
    </main>
  )
}
