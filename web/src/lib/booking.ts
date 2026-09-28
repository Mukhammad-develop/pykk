import type { IntakeHours } from './site-factory/intake'

// Booking availability, all on the Europe/London calendar/clock.
// A slot is bookable when it is in the future, on a day the business is open,
// within opening hours, on the hour or half-hour, and not already taken.

export interface SlotRequest {
  date: string // 'YYYY-MM-DD'
  time: string // 'HH:MM'
}

export function weekdayKey(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay() // 0 = Sunday
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][dow]
}

export function parseHours(value: string | undefined): { open: string; close: string } | null {
  if (!value || value.toLowerCase() === 'closed') return null
  const match = value.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/)
  if (!match) return null
  const pad = (n: string) => n.padStart(2, '0')
  return { open: `${pad(match[1])}:${match[2]}`, close: `${pad(match[3])}:${match[4]}` }
}

// The current time in London, minutes precision (for "not in the past" checks).
export function nowLondon(): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    time: `${get('hour') === '24' ? '00' : get('hour')}:${get('minute')}`,
  }
}

function londonWallTime(instantMs: number): number {
  // The wall clock London shows at this UTC instant, expressed as a naive UTC timestamp.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(instantMs))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  const hour = get('hour') === 24 ? 0 : get('hour')
  return Date.UTC(get('year'), get('month') - 1, get('day'), hour, get('minute'))
}

export function slotToUtcIso(date: string, time: string): string {
  // Bookings are stored as timestamps; London wall time is what the customer means.
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const naive = Date.UTC(y, m - 1, d, hh, mm)
  const offset = londonWallTime(naive) - naive // +1h in summer, 0 in winter
  return new Date(naive - offset).toISOString()
}

export function isSlotBookable(
  hours: IntakeHours,
  slot: SlotRequest,
  takenStarts: string[], // UTC ISO strings of existing bookings
  now: { date: string; time: string } = nowLondon(),
): { ok: true } | { ok: false; reason: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(slot.date)) return { ok: false, reason: 'Pick a date.' }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(slot.time)) return { ok: false, reason: 'Pick a time.' }
  const minutes = Number(slot.time.slice(3))
  if (minutes !== 0 && minutes !== 30) return { ok: false, reason: 'Bookings start on the hour or half-hour.' }

  if (slot.date < now.date || (slot.date === now.date && slot.time <= now.time)) {
    return { ok: false, reason: 'That time is in the past — pick a later one.' }
  }

  const dayHours = parseHours(hours[weekdayKey(slot.date)])
  if (!dayHours) return { ok: false, reason: 'We are closed that day — pick another.' }
  if (slot.time < dayHours.open || slot.time >= dayHours.close) {
    return { ok: false, reason: `That day we are open ${dayHours.open}–${dayHours.close}.` }
  }

  const startUtc = slotToUtcIso(slot.date, slot.time)
  if (takenStarts.includes(startUtc)) {
    return { ok: false, reason: 'That time is already booked — pick another.' }
  }

  return { ok: true }
}
