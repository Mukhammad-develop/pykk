import { describe, expect, it } from 'vitest'
import {
  addDays,
  diffDays,
  daysInMonth,
  dueDateInMonth,
  dueDatesBetween,
  nextDueAfter,
  nextDueOnOrAfter,
  todayLondon,
} from './billing'

describe('dueDateInMonth (anchor clamped to month length)', () => {
  it('uses the anchor day in normal months', () => {
    expect(dueDateInMonth(15, 2026, 10)).toBe('2026-10-15')
    expect(dueDateInMonth(1, 2026, 1)).toBe('2026-01-01')
  })
  it('clamps the 31st to the last day of short months', () => {
    expect(dueDateInMonth(31, 2026, 2)).toBe('2026-02-28') // not a leap year
    expect(dueDateInMonth(31, 2024, 2)).toBe('2024-02-29') // leap year
    expect(dueDateInMonth(31, 2026, 4)).toBe('2026-04-30')
    expect(dueDateInMonth(31, 2026, 3)).toBe('2026-03-31')
  })
  it('clamps 29th and 30th in February', () => {
    expect(dueDateInMonth(29, 2026, 2)).toBe('2026-02-28')
    expect(dueDateInMonth(29, 2024, 2)).toBe('2024-02-29')
    expect(dueDateInMonth(30, 2026, 2)).toBe('2026-02-28')
  })
})

describe('the spec example: anchor 31 Jan', () => {
  it('31 Jan → 28 Feb → 31 Mar', () => {
    const anchor = '2026-01-31'
    expect(dueDateInMonth(31, 2026, 2)).toBe('2026-02-28')
    expect(nextDueAfter(anchor, '2026-02-28')).toBe('2026-03-31')
    expect(nextDueAfter(anchor, '2026-03-31')).toBe('2026-04-30')
  })
})

describe('nextDueOnOrAfter', () => {
  it('returns this month when the due day is still ahead', () => {
    expect(nextDueOnOrAfter('2026-01-15', '2026-10-02')).toBe('2026-10-15')
  })
  it('rolls to next month when the due day has passed', () => {
    expect(nextDueOnOrAfter('2026-01-15', '2026-10-20')).toBe('2026-11-15')
  })
  it('includes today', () => {
    expect(nextDueOnOrAfter('2026-01-15', '2026-10-15')).toBe('2026-10-15')
  })
})

describe('dueDatesBetween', () => {
  it('finds the due date inside the lead window', () => {
    // anchor 2nd of month, window 25 Sep → 2 Oct
    expect(dueDatesBetween('2026-01-02', '2026-09-25', '2026-10-02')).toEqual(['2026-10-02'])
  })
  it('finds nothing outside the window', () => {
    expect(dueDatesBetween('2026-01-10', '2026-09-25', '2026-10-02')).toEqual([])
  })
  it('spans year boundaries', () => {
    expect(dueDatesBetween('2026-06-01', '2026-12-28', '2027-01-03')).toEqual([
      '2027-01-01',
    ])
  })
})

describe('date arithmetic', () => {
  it('addDays crosses months and years', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
    expect(addDays('2026-02-28', -1)).toBe('2026-02-27')
  })
  it('diffDays', () => {
    expect(diffDays('2026-09-25', '2026-10-02')).toBe(7)
    expect(diffDays('2026-10-02', '2026-09-25')).toBe(-7)
  })
  it('daysInMonth knows leap years', () => {
    expect(daysInMonth(2024, 2)).toBe(29)
    expect(daysInMonth(2026, 2)).toBe(28)
  })
})

describe('todayLondon (UK clock changes)', () => {
  it('handles the spring forward weekend', () => {
    // 28 Mar 2026 23:30 UTC is still 28 Mar in London (GMT)
    expect(todayLondon(new Date('2026-03-28T23:30:00Z'))).toBe('2026-03-28')
    // 29 Mar 2026 00:30 UTC is already 29 Mar in London (BST began 01:00 GMT)
    expect(todayLondon(new Date('2026-03-29T00:30:00Z'))).toBe('2026-03-29')
  })
  it('handles the autumn fallback weekend', () => {
    // 25 Oct 2026 00:30 UTC is 25 Oct in London (still BST until 01:00 UTC)
    expect(todayLondon(new Date('2026-10-25T00:30:00Z'))).toBe('2026-10-25')
    // 25 Oct 2026 23:30 UTC is 25 Oct in London (GMT again)
    expect(todayLondon(new Date('2026-10-25T23:30:00Z'))).toBe('2026-10-25')
  })
})
