'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Paste-a-link + Save for one bill. Stripe links get the reference appended
// (checkbox on by default) so a later webhook can auto-mark paid.
export function LinkSaveForm({ paymentId, existingUrl }: { paymentId: number; existingUrl: string | null }) {
  const router = useRouter()
  const [url, setUrl] = useState(existingUrl ?? '')
  const [appendReference, setAppendReference] = useState(true)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSave() {
    setPending(true)
    setError(null)
    const response = await fetch(`/api/payments/${paymentId}/link`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url, appendReference }),
    })
    setPending(false)
    if (response.ok) {
      router.refresh()
      return
    }
    const data = await response.json().catch(() => null)
    setError(data?.error ?? 'Could not save — try again.')
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://buy.stripe.com/…"
          inputMode="url"
          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          onClick={onSave}
          disabled={pending || !url.trim()}
          className="shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-400">
        <input
          type="checkbox"
          checked={appendReference}
          onChange={(e) => setAppendReference(e.target.checked)}
          className="accent-emerald-500"
        />
        Append the reference to Stripe links (enables auto “paid” later)
      </label>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
