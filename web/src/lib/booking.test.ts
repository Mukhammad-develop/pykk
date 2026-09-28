import { describe, expect, it } from 'vitest'
import { isSlotBookable, parseHours, slotToUtcIso, weekdayKey } from './booking'

const HOURS = {
  mon: '09:00–18:00',
  tue: '09:00–18:00',
  wed: 'closed',
  thu: '10:00–19:30',
  fri: '09:00–18:00',
  sat: '10:00–16:00',
  sun: 'closed',
}

const NOW = { date: '2026-10-01', time: '09:00' } // a Thursday

describe('weekdayKey', () => {
  it('maps dates to weekday keys', () => {
    expect(weekdayKey('2026-10-01')).toBe('thu')
    expect(weekdayKey('2026-10-04')).toBe('sun')
    expect(weekdayKey('2026-10-05')).toBe('mon')
  })
})

describe('parseHours', () => {
  it('parses open ranges and closed days', () => {
    expect(parseHours('09:00–18:00')).toEqual({ open: '09:00', close: '18:00' })
    expect(parseHours('9:00-18:30')).toEqual({ open: '09:00', close: '18:30' })
    expect(parseHours('closed')).toBeNull()
    expect(parseHours(undefined)).toBeNull()
    expect(parseHours('[[NEEDS INFO: hours]]')).toBeNull()
  })
})

describe('slotToUtcIso (London wall time → UTC)', () => {
  it('subtracts an hour in summer (BST)', () => {
    expect(slotToUtcIso('2026-07-01', '10:00')).toBe('2026-07-01T09:00:00.000Z')
  })
  it('is unchanged in winter (GMT)', () => {
    expect(slotToUtcIso('2026-01-15', '10:00')).toBe('2026-01-15T10:00:00.000Z')
  })
})

describe('isSlotBookable', () => {
  it('accepts a valid future slot', () => {
    expect(isSlotBookable(HOURS, { date: '2026-10-01', time: '10:00' }, [], NOW)).toEqual({ ok: true })
  })
  it('rejects past times', () => {
    expect(isSlotBookable(HOURS, { date: '2026-09-30', time: '12:00' }, [], NOW).ok).toBe(false)
    expect(isSlotBookable(HOURS, { date: '2026-10-01', time: '08:30' }, [], NOW).ok).toBe(false)
  })
  it('rejects closed days', () => {
    const res = isSlotBookable(HOURS, { date: '2026-10-04', time: '10:00' }, [], NOW)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.reason).toContain('closed')
  })
  it('rejects outside opening hours', () => {
    expect(isSlotBookable(HOURS, { date: '2026-10-01', time: '08:00' }, [], NOW).ok).toBe(false)
    expect(isSlotBookable(HOURS, { date: '2026-10-01', time: '19:30' }, [], NOW).ok).toBe(false)
    // closing time itself is not bookable, last slot is 30 min before close
    expect(isSlotBookable(HOURS, { date: '2026-10-05', time: '18:00' }, [], NOW).ok).toBe(false)
    expect(isSlotBookable(HOURS, { date: '2026-10-05', time: '17:30' }, [], NOW).ok).toBe(true)
  })
  it('rejects non-hour/half-hour starts', () => {
    expect(isSlotBookable(HOURS, { date: '2026-10-01', time: '10:15' }, [], NOW).ok).toBe(false)
    expect(isSlotBookable(HOURS, { date: '2026-10-01', time: '10:30' }, [], NOW).ok).toBe(true)
  })
  it('rejects already-taken slots (UTC-aware)', () => {
    const taken = [slotToUtcIso('2026-10-01', '10:00')]
    const res = isSlotBookable(HOURS, { date: '2026-10-01', time: '10:00' }, taken, NOW)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.reason).toContain('already booked')
  })
  it('rejects malformed input', () => {
    expect(isSlotBookable(HOURS, { date: 'not-a-date', time: '10:00' }, [], NOW).ok).toBe(false)
    expect(isSlotBookable(HOURS, { date: '2026-10-01', time: '99:99' }, [], NOW).ok).toBe(false)
  })
})
