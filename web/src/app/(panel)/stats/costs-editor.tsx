'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['hosting', 'sim_plan', 'sms_api', 'ai', 'domain', 'other']

export function CostsEditor({
  month,
  rows,
}: {
  month: string
  rows: { id: number; category: string; amountPence: number; note: string | null }[]
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function onAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    const form = event.currentTarget
    const data = new FormData(form)
    await fetch('/api/costs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        month,
        category: data.get('category'),
        amountPence: Math.round(Number(data.get('amount')) * 100),
        note: data.get('note'),
      }),
    })
    setPending(false)
    form.reset()
    router.refresh()
  }

  async function onDelete(id: number) {
    await fetch(`/api/costs?id=${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const input =
    'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500'

  return (
    <div>
      {rows.length > 0 && (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm">
              <span className="text-slate-300">
                {row.category.replace(/_/g, ' ')}
                {row.note ? <span className="text-slate-500"> · {row.note}</span> : null}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-slate-100">£{(row.amountPence / 100).toFixed(2)}</span>
                <button
                  type="button"
                  onClick={() => onDelete(row.id)}
                  className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:border-red-700 hover:text-red-300"
                >
                  ✕
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={onAdd} className="mt-3 flex flex-wrap items-center gap-2">
        <select name="category" className={input} defaultValue="hosting">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <input name="amount" type="number" step="0.01" min="0" placeholder="£" required className={`${input} w-24`} />
        <input name="note" placeholder="note (optional)" className={input} />
        <button type="submit" disabled={pending} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-50">
          {pending ? 'Adding…' : '+ Add cost'}
        </button>
      </form>
    </div>
  )
}
