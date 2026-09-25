import { describe, expect, it } from 'vitest'
import { formatLongDate, formatMoneyPence, ordinal } from './format'

describe('ordinal', () => {
  it('handles the spec examples', () => {
    expect(ordinal(1)).toBe('1st')
    expect(ordinal(2)).toBe('2nd')
    expect(ordinal(3)).toBe('3rd')
    expect(ordinal(4)).toBe('4th')
    expect(ordinal(11)).toBe('11th')
    expect(ordinal(12)).toBe('12th')
    expect(ordinal(13)).toBe('13th')
    expect(ordinal(21)).toBe('21st')
    expect(ordinal(22)).toBe('22nd')
    expect(ordinal(23)).toBe('23rd')
    expect(ordinal(31)).toBe('31st')
  })
})

describe('formatLongDate', () => {
  it('renders the long UK form', () => {
    expect(formatLongDate('2026-10-02')).toBe('2nd October 2026')
    expect(formatLongDate('2026-01-31')).toBe('31st January 2026')
  })
})

describe('formatMoneyPence', () => {
  it('renders pounds from pence', () => {
    expect(formatMoneyPence(499)).toBe('£4.99')
    expect(formatMoneyPence(0)).toBe('£0.00')
    expect(formatMoneyPence(1497)).toBe('£14.97')
  })
})
