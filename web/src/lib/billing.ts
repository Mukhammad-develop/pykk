// The billing brain. All dates are ISO strings 'YYYY-MM-DD' on the
// Europe/London calendar — never instants — so UK clock changes can't bite.

export type ISODate = string

export function parseISODate(iso: ISODate): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d }
}

export function toISODate(y: number, m: number, d: number): ISODate {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${y}-${pad(m)}-${pad(d)}`
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function addDays(iso: ISODate, days: number): ISODate {
  const { y, m, d } = parseISODate(iso)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return toISODate(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate())
}

// Whole days from a to b (b - a).
export function diffDays(a: ISODate, b: ISODate): number {
  const pa = parseISODate(a)
  const pb = parseISODate(b)
  const ua = Date.UTC(pa.y, pa.m - 1, pa.d)
  const ub = Date.UTC(pb.y, pb.m - 1, pb.d)
  return Math.round((ub - ua) / 86_400_000)
}

// "Today" on the Europe/London calendar.
export function todayLondon(now: Date = new Date()): ISODate {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

// The due date in a given month for a given anchor day: the anchor day clamped
// to the month's last day. Anchor 31 Jan → 28/29 Feb → 31 Mar.
export function dueDateInMonth(anchorDay: number, year: number, month: number): ISODate {
  return toISODate(year, month, Math.min(anchorDay, daysInMonth(year, month)))
}

// The due date that follows a given due date, for the same anchor.
export function nextDueAfter(anchorIso: ISODate, afterDue: ISODate): ISODate {
  const anchorDay = parseISODate(anchorIso).d
  const { y, m } = parseISODate(afterDue)
  const next = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 }
  return dueDateInMonth(anchorDay, next.y, next.m)
}

// The next due date on or after `from`.
export function nextDueOnOrAfter(anchorIso: ISODate, from: ISODate): ISODate {
  const anchorDay = parseISODate(anchorIso).d
  const { y, m } = parseISODate(from)
  const thisMonth = dueDateInMonth(anchorDay, y, m)
  if (thisMonth >= from) return thisMonth
  return nextDueAfter(anchorIso, thisMonth)
}

// All due dates in [from, to] (inclusive) for an anchor date.
export function dueDatesBetween(anchorIso: ISODate, from: ISODate, to: ISODate): ISODate[] {
  const anchorDay = parseISODate(anchorIso).d
  const { y: y0, m: m0 } = parseISODate(from)
  const { y: y1, m: m1 } = parseISODate(to)
  const result: ISODate[] = []
  let y = y0
  let m = m0
  while (y < y1 || (y === y1 && m <= m1)) {
    const due = dueDateInMonth(anchorDay, y, m)
    if (due >= from && due <= to) result.push(due)
    if (m === 12) {
      y += 1
      m = 1
    } else {
      m += 1
    }
  }
  return result
}
