'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function onLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500"
    >
      Log out
    </button>
  )
}
