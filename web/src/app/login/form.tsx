'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { login, type LoginFormState } from './actions'

const initialState: LoginFormState = { error: null }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
    >
      {pending ? 'Signing in…' : 'Sign in'}
    </button>
  )
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialState)

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      {state.error && (
        <p role="alert" className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-300">
          {state.error}
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
      <SubmitButton />
    </form>
  )
}
