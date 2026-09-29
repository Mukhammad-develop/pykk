'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// "Edit with AI": type a change ("make the footer dark green"), the AI applies
// it surgically to the existing site — no rebuild.
export function AiEditCard({ businessId }: { businessId: number }) {
  const router = useRouter()
  const [instruction, setInstruction] = useState('')
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onApply() {
    if (instruction.trim().length < 3) return
    setPending(true)
    setResult(null)
    setError(null)
    const res = await fetch(`/api/businesses/${businessId}/edit-website`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instruction: instruction.trim() }),
    })
    const data = await res.json().catch(() => null)
    setPending(false)
    if (res.ok) {
      setResult('✓ Edit started — watch the status above, it updates when done.')
      setInstruction('')
      router.refresh()
    } else {
      setError(data?.error ?? 'The edit failed — try different wording.')
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="text-sm font-semibold text-slate-200">Edit with AI</h2>
      <p className="mt-1 text-xs text-slate-500">
        Describe a small change — the AI applies it to the existing site without rebuilding.
        e.g. “make the footer dark green”, “bigger headline”, “move the map below the hours”.
      </p>
      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        rows={2}
        placeholder="What should change?"
        className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onApply}
          disabled={pending || instruction.trim().length < 3}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {pending ? 'Editing…' : 'Apply edit'}
        </button>
        {result && <span className="text-xs text-emerald-400">{result}</span>}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </section>
  )
}
