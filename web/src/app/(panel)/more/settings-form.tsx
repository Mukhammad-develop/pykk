'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SettingsForm({
  values,
}: {
  values: { leadDays: string; graceDays: string; defaultPricePence: string; clientMessageTemplate: string }
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [template, setTemplate] = useState(values.clientMessageTemplate)

  const preview = template
    .split('{owner_name}').join('Jane')
    .split('{business_name}').join('Fade & Co.')
    .split('{reference}').join('JK891P')
    .split('{amount}').join('4.99')
    .split('{due_date_long}').join('2nd October 2026')
    .split('{client_pay_url}').join('https://admin.pykk.uk/pay/JK891P?t=abc123')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setSaved(false)
    const data = new FormData(event.currentTarget)
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        lead_days: data.get('leadDays'),
        grace_days: data.get('graceDays'),
        default_price_pence: data.get('defaultPricePence'),
        client_message_template: template,
      }),
    })
    setPending(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    }
  }

  const input =
    'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500'
  const label = 'flex flex-col gap-1 text-sm text-slate-300'

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        <label className={label}>
          Lead days
          <input name="leadDays" defaultValue={values.leadDays} inputMode="numeric" className={input} />
        </label>
        <label className={label}>
          Grace days
          <input name="graceDays" defaultValue={values.graceDays} inputMode="numeric" className={input} />
        </label>
        <label className={label}>
          Price (pence)
          <input name="defaultPricePence" defaultValue={values.defaultPricePence} inputMode="numeric" className={input} />
        </label>
      </div>
      <label className={label}>
        Client message template
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          rows={4}
          className={input}
        />
      </label>
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
        <p className="mb-1 font-semibold text-slate-300">Preview:</p>
        <p>{preview}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">
          {pending ? 'Saving…' : 'Save settings'}
        </button>
        {saved && <span className="text-xs text-emerald-400">✓ Saved</span>}
      </div>
    </form>
  )
}

export function LogoutAllButton() {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  async function onLogoutAll() {
    await fetch('/api/auth/logout-all', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <span className="text-xs text-slate-400">Log out everywhere, including this device?</span>
        <button type="button" onClick={onLogoutAll} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">
          Yes, log out all
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300">
          No
        </button>
      </span>
    )
  }
  return (
    <button type="button" onClick={() => setConfirming(true)} className="rounded-lg border border-red-800 px-3 py-2 text-xs text-red-300 hover:bg-red-950">
      Log out all devices
    </button>
  )
}
