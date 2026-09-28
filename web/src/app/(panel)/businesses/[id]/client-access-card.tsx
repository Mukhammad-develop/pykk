'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

// Founder card: create/reset the client's login for {slug}.pykk.uk/admin and
// copy a ready message with their link and email.
export function ClientAccessCard({ businessId, slug }: { businessId: number; slug: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [existing, setExisting] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/businesses/${businessId}/client-access`)
      .then((r) => r.json())
      .then((d) => {
        setExisting(d.email)
        if (d.email) setEmail(d.email)
      })
      .catch(() => {})
  }, [businessId])

  async function onSave() {
    setPending(true)
    setError(null)
    setMessage(null)
    const res = await fetch(`/api/businesses/${businessId}/client-access`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    setPending(false)
    const data = await res.json().catch(() => null)
    if (res.ok) {
      setExisting(email)
      setMessage('✓ Login saved — send them the access message below.')
      setPassword('')
      router.refresh()
    } else {
      setError(data?.error ?? 'Could not save — try again.')
    }
  }

  async function onCopy() {
    const text = `Your PYKK client area is ready! Open https://${slug}.pykk.uk/admin and log in with:\nEmail: ${email}\nPassword: (the one I set for you — I'll send it separately)\nThere you can see and pay your bond, update your website info, and check bookings.`
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const area = document.createElement('textarea')
      area.value = text
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="text-sm font-semibold text-slate-200">Client access</h2>
      <p className="mt-1 text-xs text-slate-500">
        Their admin panel: <span className="text-sky-400">{slug}.pykk.uk/admin</span>
        {existing ? ` — login set for ${existing}` : ' — no login yet'}.
      </p>
      <div className="mt-3 grid gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Their email"
          type="email"
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={existing ? 'New password (min 10) — resets the old one' : 'Password for them (min 10)'}
          type="text"
          autoComplete="off"
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={pending || !email || password.length < 10}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {pending ? 'Saving…' : existing ? 'Reset login' : 'Create login'}
        </button>
        {existing && (
          <button
            type="button"
            onClick={onCopy}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500"
          >
            {copied ? '✓ Copied!' : 'Copy access message'}
          </button>
        )}
        {message && <span className="text-xs text-emerald-400">{message}</span>}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </section>
  )
}
