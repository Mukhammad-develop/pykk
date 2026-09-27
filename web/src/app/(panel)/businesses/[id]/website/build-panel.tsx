'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

// The build button + live status for the website factory.
export function BuildPanel({
  businessId,
  slug,
  initialStatus,
  initialNote,
  hasIntake,
}: {
  businessId: number
  slug: string
  initialStatus: string
  initialNote: string | null
  hasIntake: boolean
}) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [note, setNote] = useState(initialNote)
  const [pending, setPending] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (status === 'building') {
      timer.current = setInterval(async () => {
        const res = await fetch(`/api/businesses/${businessId}/build-website`)
        if (res.ok) {
          const data = await res.json()
          setStatus(data.websiteStatus)
          setNote(data.websiteNote)
          if (data.websiteStatus !== 'building') {
            if (timer.current) clearInterval(timer.current)
            router.refresh()
          }
        }
      }, 4000)
      return () => {
        if (timer.current) clearInterval(timer.current)
      }
    }
  }, [status, businessId, router])

  async function onBuild() {
    setPending(true)
    const res = await fetch(`/api/businesses/${businessId}/build-website`, { method: 'POST' })
    setPending(false)
    if (res.ok) {
      setStatus('building')
      setNote(null)
    }
  }

  const statusLine: Record<string, string> = {
    none: 'Not built yet — fill in the intake below and press the button.',
    building: '🔨 Building the website… (about a minute — you can wait or come back)',
    live: '✅ Website is live',
    live_fallback: '✅ Website is live (built from the fallback template)',
    failed: '❌ Build failed — see the note, fix, and try again.',
  }

  return (
    <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-300">{statusLine[status] ?? status}</p>
        <button
          type="button"
          onClick={onBuild}
          disabled={pending || status === 'building' || !hasIntake}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {status === 'building' ? 'Building…' : status === 'none' ? 'Build the website' : 'Rebuild'}
        </button>
      </div>
      {!hasIntake && status === 'none' && (
        <p className="mt-2 text-xs text-amber-400">Save the intake form below first.</p>
      )}
      {(status === 'live' || status === 'live_fallback') && (
        <p className="mt-2 text-xs text-slate-400">
          <a href={`https://${slug}.pykk.uk`} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
            {slug}.pykk.uk ↗
          </a>{' '}
          (padlock may take a few minutes on first build)
        </p>
      )}
      {note && <p className="mt-2 text-xs text-slate-500">{note}</p>}
    </section>
  )
}
