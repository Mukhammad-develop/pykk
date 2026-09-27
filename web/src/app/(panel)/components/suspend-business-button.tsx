'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Suspend a business manually (turns its site off). Inline confirmation.
export function SuspendBusinessButton({ businessId }: { businessId: number }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending] = useState(false)

  async function onSuspend() {
    setPending(true)
    const response = await fetch(`/api/businesses/${businessId}/status`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'suspend' }),
    })
    setPending(false)
    if (response.ok) {
      router.refresh()
    }
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-xs text-red-300">Turn the site off?</span>
        <button
          type="button"
          onClick={onSuspend}
          disabled={pending}
          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {pending ? 'Suspending…' : 'Yes, suspend'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300"
        >
          No
        </button>
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="rounded-lg border border-red-800 px-3 py-2 text-xs text-red-300 hover:bg-red-950"
    >
      Suspend site
    </button>
  )
}
