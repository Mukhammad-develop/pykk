'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const BUTTONS: { action: string; label: string; showFor: string[]; danger?: boolean }[] = [
  { action: 'pause', label: 'Pause', showFor: ['active'] },
  { action: 'suspend', label: 'Suspend site', showFor: ['active', 'paused'], danger: true },
  { action: 'reactivate', label: 'Reactivate', showFor: ['paused', 'suspended'] },
  { action: 'cancel', label: 'Cancel bond', showFor: ['active', 'paused', 'suspended'], danger: true },
]

export function StatusActions({ businessId, status }: { businessId: number; status: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function run(action: string) {
    setPending(true)
    const response = await fetch(`/api/businesses/${businessId}/status`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    setPending(false)
    setConfirming(null)
    if (response.ok) router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {BUTTONS.filter((b) => b.showFor.includes(status)).map((b) =>
        confirming === b.action ? (
          <span key={b.action} className="inline-flex items-center gap-2">
            <span className="text-xs text-slate-400">Sure?</span>
            <button
              type="button"
              onClick={() => run(b.action)}
              disabled={pending}
              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              {pending ? 'Working…' : `Yes, ${b.label.toLowerCase()}`}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(null)}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300"
            >
              No
            </button>
          </span>
        ) : (
          <button
            key={b.action}
            type="button"
            onClick={() => (b.danger ? setConfirming(b.action) : run(b.action))}
            disabled={pending}
            className={`rounded-lg border px-3 py-2 text-xs ${
              b.danger
                ? 'border-red-800 text-red-300 hover:bg-red-950'
                : 'border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            {b.label}
          </button>
        ),
      )}
    </div>
  )
}
