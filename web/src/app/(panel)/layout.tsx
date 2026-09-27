import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { LogoutButton } from './logout-button'
import { MobileTabs } from './mobile-tabs'

export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-20 pt-6">
      <header className="flex items-center justify-between border-b border-slate-800 pb-4">
        <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
          PYKK Admin
        </Link>
        <span className="hidden text-xs text-slate-500 sm:inline">{session.email}</span>
        <LogoutButton />
      </header>
      <div className="flex-1 pt-6">{children}</div>
      <MobileTabs />
    </div>
  )
}
