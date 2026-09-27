'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function PriceNotesForm({
  businessId,
  pricePence,
  notes,
}: {
  businessId: number
  pricePence: number
  notes: string | null
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setSaved(false)
    const form = new FormData(event.currentTarget)
    const response = await fetch(`/api/businesses/${businessId}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        pricePence: Math.round(Number(form.get('pricePounds')) * 100),
        notes: form.get('notes'),
      }),
    })
    setPending(false)
    if (response.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm text-slate-300">
        Monthly price (£) — applies from the next bill
        <input
          name="pricePounds"
          type="number"
          step="0.01"
          min="0"
          defaultValue={(pricePence / 100).toFixed(2)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 outline-none focus:border-emerald-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-slate-300">
        Notes
        <textarea
          name="notes"
          rows={3}
          defaultValue={notes ?? ''}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-base text-slate-100 outline-none focus:border-emerald-500"
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
        {saved && <span className="text-xs text-emerald-400">✓ Saved</span>}
      </div>
    </form>
  )
}
