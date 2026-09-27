'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const METHODS = [
  { value: 'link', label: 'Link' },
  { value: 'cash', label: 'Cash' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'card_in_person', label: 'Card in person' },
  { value: 'other', label: 'Other' },
]

// Mark paid (with 10-minute undo), Waive and Void for one bill.
export function PaymentActions({
  paymentId,
  today,
  undoUntil,
}: {
  paymentId: number
  today: string
  undoUntil: string | null
}) {
  const router = useRouter()
  const [mode, setMode] = useState<'idle' | 'paid' | 'waive' | 'void'>('idle')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [undoLeft, setUndoLeft] = useState(undoUntil)

  async function post(path: string, body: object) {
    setPending(true)
    setError(null)
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    setPending(false)
    const data = await response.json().catch(() => null)
    if (response.ok) {
      if (data?.undoUntil) setUndoLeft(data.undoUntil)
      setMode('idle')
      router.refresh()
      return true
    }
    setError(data?.error ?? 'Something went wrong — try again.')
    return false
  }

  async function onMarkPaid(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await post(`/api/payments/${paymentId}/mark-paid`, {
      paidAt: form.get('paidAt'),
      method: form.get('method'),
      note: form.get('note'),
    })
  }

  async function onReason(event: React.FormEvent<HTMLFormElement>, kind: 'waive' | 'void') {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await post(`/api/payments/${paymentId}/${kind}`, { reason: form.get('reason') })
  }

  if (undoLeft && new Date(undoLeft).getTime() > Date.now()) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          await post(`/api/payments/${paymentId}/undo-paid`, {})
          setUndoLeft(null)
        }}
        className="rounded-lg border border-amber-700 bg-amber-950 px-3 py-2 text-xs text-amber-300"
      >
        ↩ Undo “paid” ({Math.max(1, Math.ceil((new Date(undoLeft).getTime() - Date.now()) / 60000))} min left)
      </button>
    )
  }

  if (mode === 'paid') {
    return (
      <form onSubmit={onMarkPaid} className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-950 p-3">
        <div className="flex gap-2">
          <label className="flex-1 text-xs text-slate-400">
            Date
            <input name="paidAt" type="date" defaultValue={today} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-100" />
          </label>
          <label className="flex-1 text-xs text-slate-400">
            Method
            <select name="method" defaultValue="link" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-100">
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </label>
        </div>
        <input name="note" placeholder="Note (optional)" className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-100" />
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-50">
            {pending ? 'Saving…' : 'Confirm paid'}
          </button>
          <button type="button" onClick={() => setMode('idle')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    )
  }

  if (mode === 'waive' || mode === 'void') {
    return (
      <form onSubmit={(e) => onReason(e, mode)} className="flex flex-col gap-2 rounded-xl border border-slate-700 bg-slate-950 p-3">
        <p className="text-xs text-slate-400">
          {mode === 'waive' ? 'Waive this bill (free month).' : 'Void this bill (created by mistake).'} A reason is required.
        </p>
        <input name="reason" required placeholder="Reason…" className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-100" />
        <div className="flex gap-2">
          <button type="submit" disabled={pending} className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 disabled:opacity-50">
            {pending ? 'Saving…' : mode === 'waive' ? 'Confirm waive' : 'Confirm void'}
          </button>
          <button type="button" onClick={() => setMode('idle')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">
            Cancel
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </form>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setMode('paid')}
        className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
      >
        Mark paid
      </button>
      <button type="button" onClick={() => setMode('waive')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500">
        Waive
      </button>
      <button type="button" onClick={() => setMode('void')} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-500 hover:border-slate-600">
        Void
      </button>
      {error && <p className="w-full text-xs text-red-400">{error}</p>}
    </div>
  )
}
