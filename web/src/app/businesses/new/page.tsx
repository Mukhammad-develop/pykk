import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { NewBusinessForm } from './form'
import { getSettingNumber } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Add business — PYKK Admin' }

export default async function NewBusinessPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const defaultPrice = await getSettingNumber('default_price_pence', 499)

  return (
    <main className="mx-auto min-h-dvh w-full max-w-lg px-4 py-8">
      <header>
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-200">← Back</Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-100">Add business</h1>
        <p className="mt-1 text-sm text-slate-400">
          Adds the client, records their first month as paid, and anchors their
          future bills to that date.
        </p>
      </header>
      <NewBusinessForm defaultPricePence={defaultPrice} />
    </main>
  )
}
