'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BUSINESS_TYPES, PAID_METHODS } from '@/db/schema'
import { todayLondon } from '@/lib/billing'

const inputClass =
  'rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 text-base text-slate-100 outline-none focus:border-emerald-500'
const labelClass = 'flex flex-col gap-1 text-sm text-slate-300'

const TYPE_LABELS: Record<string, string> = {
  barber_hair: 'Barber & hair',
  beauty_spa: 'Beauty & spa',
  cafe: 'Café',
  restaurant: 'Restaurant',
  cleaning: 'Cleaning',
  laundry: 'Laundry',
  retail: 'Retail',
  local_services: 'Local services',
  other: 'Other',
}

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  card_in_person: 'Card in person',
  bank_transfer: 'Bank transfer',
  link: 'Payment link',
  other: 'Other',
}

export function NewBusinessForm({ defaultPricePence }: { defaultPricePence: number }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)
    const form = new FormData(event.currentTarget)
    const pricePounds = Number(form.get('pricePounds'))
    const response = await fetch('/api/businesses', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        slug: form.get('slug'),
        type: form.get('type'),
        ownerName: form.get('ownerName'),
        ownerEmail: form.get('ownerEmail'),
        ownerPhone: form.get('ownerPhone'),
        pricePence: Number.isFinite(pricePounds) ? Math.round(pricePounds * 100) : undefined,
        firstPaymentDate: form.get('firstPaymentDate'),
        firstPaymentMethod: form.get('firstPaymentMethod'),
        notes: form.get('notes'),
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
      <label className={labelClass}>
        Business name *
        <input name="name" required className={inputClass} placeholder="Fade & Co." />
      </label>
      <label className={labelClass}>
        Slug * <span className="text-xs text-slate-500">becomes slug.pykk.uk — must match the site folder</span>
        <input
          name="slug"
          required
          pattern="[a-z0-9][a-z0-9\-]{1,38}[a-z0-9]"
          title="3–40 characters: lowercase a–z, 0–9 and hyphens"
          className={inputClass}
          placeholder="fadeandco"
        />
      </label>
      <label className={labelClass}>
        Type *
        <select name="type" required className={inputClass} defaultValue="barber_hair">
          {BUSINESS_TYPES.map((type) => (
            <option key={type} value={type}>{TYPE_LABELS[type]}</option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Owner name
        <input name="ownerName" className={inputClass} placeholder="Jane Smith" />
      </label>
      <label className={labelClass}>
        Owner email
        <input name="ownerEmail" type="email" className={inputClass} placeholder="jane@example.com" />
      </label>
      <label className={labelClass}>
        Owner phone
        <input name="ownerPhone" className={inputClass} placeholder="07…" />
      </label>
      <label className={labelClass}>
        Monthly price (£) <span className="text-xs text-slate-500">default {(defaultPricePence / 100).toFixed(2)}</span>
        <input
          name="pricePounds"
          type="number"
          step="0.01"
          min="0"
          className={inputClass}
          defaultValue={(defaultPricePence / 100).toFixed(2)}
        />
      </label>
      <label className={labelClass}>
        First payment date * <span className="text-xs text-slate-500">the day they paid their first month — future bills anchor to it</span>
        <input name="firstPaymentDate" type="date" required className={inputClass} defaultValue={todayLondon()} />
      </label>
      <label className={labelClass}>
        First payment method *
        <select name="firstPaymentMethod" required className={inputClass} defaultValue="card_in_person">
          {PAID_METHODS.map((method) => (
            <option key={method} value={method}>{METHOD_LABELS[method]}</option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        Notes
        <textarea name="notes" rows={3} className={inputClass} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-lg bg-emerald-500 px-4 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Add business'}
      </button>
    </form>
  )
}
