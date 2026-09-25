'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password'),
      }),
    })
    setPending(false)
    if (response.ok) {
      router.push('/')
      router.refresh()
      return
    }
    const data = await response.json().catch(() => null)
    setError(data?.error ?? 'Something went wrong — please try again.')
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm text-slate-300">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-base text-slate-100 outline-none focus:border-emerald-500"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-slate-300">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-base text-slate-100 outline-none focus:border-emerald-500"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
