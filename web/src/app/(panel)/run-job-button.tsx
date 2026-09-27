'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function RunJobButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function onRun() {
    setPending(true)
    setResult(null)
    const response = await fetch('/api/internal/run-daily-job', { method: 'POST' })
    setPending(false)
    if (response.ok) {
      const data = await response.json()
      setResult(`Done: ${data.created} bill(s) created, ${data.overdue} marked overdue.`)
      router.refresh()
    } else {
      setResult('The job failed — please try again.')
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onRun}
        disabled={pending}
        className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 disabled:opacity-60"
      >
        {pending ? 'Running…' : 'Run daily job now'}
      </button>
      {result && <span className="text-xs text-slate-400">{result}</span>}
    </span>
  )
}
