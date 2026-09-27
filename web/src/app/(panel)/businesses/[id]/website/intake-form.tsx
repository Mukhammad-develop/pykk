'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DAY_ORDER, TYPE_PRESETS, type SiteIntake, type IntakeService } from '@/lib/site-factory/intake'

const input =
  'rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500 w-full'
const label = 'flex flex-col gap-1 text-sm text-slate-300'
const section = 'mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4'

export function IntakeForm({
  businessId,
  businessType,
  initialIntake,
}: {
  businessId: number
  businessType: string
  initialIntake: SiteIntake
}) {
  const router = useRouter()
  const [intake, setIntake] = useState<SiteIntake>(initialIntake)
  const [pending, setPending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof SiteIntake>(key: K, value: SiteIntake[K]) =>
    setIntake((prev) => ({ ...prev, [key]: value }))

  function setService(index: number, field: keyof IntakeService, value: string) {
    const services = intake.services.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    set('services', services)
  }

  async function onSave() {
    setPending(true)
    setMessage(null)
    setError(null)
    const res = await fetch(`/api/businesses/${businessId}/intake`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(intake),
    })
    setPending(false)
    if (res.ok) {
      setMessage('✓ Intake saved — you can build the website now.')
      router.refresh()
    } else {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'Could not save — try again.')
    }
  }

  async function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setError(null)
    setMessage(null)
    const form = new FormData()
    for (const file of Array.from(files)) form.append('photos', file)
    const res = await fetch(`/api/businesses/${businessId}/photos`, { method: 'POST', body: form })
    setUploading(false)
    const data = await res.json().catch(() => null)
    if (res.ok) {
      set('photos', data.photos)
      setMessage(`✓ ${data.saved.length} photo(s) uploaded and converted.`)
      router.refresh()
    } else {
      setError(data?.error ?? 'Upload failed — try again.')
    }
    event.target.value = ''
  }

  return (
    <div>
      <section className={section}>
        <h2 className="text-sm font-semibold text-slate-200">Contact</h2>
        <div className="mt-3 grid gap-3">
          <label className={label}>Owner name
            <input className={input} value={intake.ownerName} onChange={(e) => set('ownerName', e.target.value)} />
          </label>
          <label className={label}>Phone
            <input className={input} value={intake.phone} onChange={(e) => set('phone', e.target.value)} placeholder="07…" />
          </label>
          <label className={label}>WhatsApp
            <input className={input} value={intake.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="44…" />
          </label>
          <label className={label}>Email
            <input className={input} type="email" value={intake.email} onChange={(e) => set('email', e.target.value)} />
          </label>
        </div>
      </section>

      <section className={section}>
        <h2 className="text-sm font-semibold text-slate-200">Location</h2>
        <div className="mt-3 grid gap-3">
          <label className={label}>Address
            <input className={input} value={intake.address} onChange={(e) => set('address', e.target.value)} placeholder="12 High Street, Watford" />
          </label>
          <label className={label}>Landmark / town
            <input className={input} value={intake.landmark} onChange={(e) => set('landmark', e.target.value)} placeholder="near the station" />
          </label>
        </div>
      </section>

      <section className={section}>
        <h2 className="text-sm font-semibold text-slate-200">Opening hours</h2>
        <p className="mt-1 text-xs text-slate-500">e.g. 09:00–18:00, or “closed”</p>
        <div className="mt-3 grid gap-2">
          {DAY_ORDER.map(([key, day]) => (
            <label key={key} className="grid grid-cols-[6.5rem_1fr] items-center gap-2 text-sm text-slate-300">
              {day}
              <input
                className={input}
                value={intake.hours[key] ?? ''}
                onChange={(e) => set('hours', { ...intake.hours, [key]: e.target.value })}
                placeholder="09:00–18:00 or closed"
              />
            </label>
          ))}
        </div>
      </section>

      <section className={section}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">Services &amp; prices</h2>
          {TYPE_PRESETS[businessType] && intake.services.length === 0 && (
            <button
              type="button"
              onClick={() => set('services', [...TYPE_PRESETS[businessType]])}
              className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:border-slate-500"
            >
              Load typical list
            </button>
          )}
        </div>
        <div className="mt-3 grid gap-2">
          {intake.services.map((service, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                className={input}
                value={service.name}
                onChange={(e) => setService(index, 'name', e.target.value)}
                placeholder="Service name"
              />
              <input
                className={`${input} w-24 shrink-0`}
                value={service.price}
                onChange={(e) => setService(index, 'price', e.target.value)}
                placeholder="£ 0.00"
                inputMode="decimal"
              />
              <button
                type="button"
                onClick={() => set('services', intake.services.filter((_, i) => i !== index))}
                className="shrink-0 rounded-lg border border-slate-700 px-2 py-2 text-xs text-slate-400 hover:border-red-700 hover:text-red-300"
                aria-label="Remove"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => set('services', [...intake.services, { name: '', price: '' }])}
          className="mt-3 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500"
        >
          + Add row
        </button>
      </section>

      <section className={section}>
        <h2 className="text-sm font-semibold text-slate-200">Details</h2>
        <div className="mt-3 grid gap-3">
          {businessType === 'barber_hair' && (
            <label className={label}>Walk-ins or appointments?
              <select
                className={input}
                value={intake.extras.barberMode ?? ''}
                onChange={(e) => set('extras', { ...intake.extras, barberMode: (e.target.value || undefined) as SiteIntake['extras']['barberMode'] })}
              >
                <option value="">—</option>
                <option value="walk-ins">Walk-ins welcome</option>
                <option value="appointments">By appointment</option>
                <option value="both">Both</option>
              </select>
            </label>
          )}
          {businessType === 'beauty_spa' && (
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={intake.extras.appointmentOnly ?? false}
                onChange={(e) => set('extras', { ...intake.extras, appointmentOnly: e.target.checked })}
                className="accent-emerald-500"
              />
              By appointment only
            </label>
          )}
          {businessType === 'cafe' && (
            <label className={label}>Eat in or takeaway?
              <select
                className={input}
                value={intake.extras.cafeService ?? ''}
                onChange={(e) => set('extras', { ...intake.extras, cafeService: (e.target.value || undefined) as SiteIntake['extras']['cafeService'] })}
              >
                <option value="">—</option>
                <option value="eat-in">Eat in</option>
                <option value="takeaway">Takeaway</option>
                <option value="both">Both</option>
              </select>
            </label>
          )}
          {['cleaning', 'laundry', 'local_services', 'other'].includes(businessType) && (
            <>
              <label className={label}>Areas covered
                <input
                  className={input}
                  value={intake.extras.areasCovered ?? ''}
                  onChange={(e) => set('extras', { ...intake.extras, areasCovered: e.target.value })}
                  placeholder="Watford, Bushey, Rickmansworth"
                />
              </label>
              <label className={label}>Call-out info
                <input
                  className={input}
                  value={intake.extras.callOut ?? ''}
                  onChange={(e) => set('extras', { ...intake.extras, callOut: e.target.value })}
                  placeholder="Free call-out within 5 miles"
                />
              </label>
            </>
          )}
          <label className={label}>Additional info
            <textarea
              className={input}
              rows={4}
              value={intake.additionalInfo}
              onChange={(e) => set('additionalInfo', e.target.value)}
              placeholder="Anything else the website should say — parking, languages spoken, what makes you different…"
            />
          </label>
        </div>
      </section>

      <section className={section}>
        <h2 className="text-sm font-semibold text-slate-200">Photos</h2>
        <p className="mt-1 text-xs text-slate-500">Up to 10 at a time, JPG/PNG/WebP, max 5 MB each — converted to WebP automatically.</p>
        <label className="mt-3 inline-block rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-slate-500">
          {uploading ? 'Uploading…' : 'Choose photos…'}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onUpload} disabled={uploading} />
        </label>
        {intake.photos.length > 0 && (
          <ul className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
            {intake.photos.map((p) => (
              <li key={p} className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5">📷 {p}</li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 flex items-center gap-3 pb-4">
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {pending ? 'Saving…' : 'Save intake'}
        </button>
        {message && <span className="text-xs text-emerald-400">{message}</span>}
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </div>
  )
}
