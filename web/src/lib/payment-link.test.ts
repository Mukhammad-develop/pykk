import { describe, expect, it } from 'vitest'
import { appendStripeReference, validatePaymentLink } from './payment-link'

describe('validatePaymentLink', () => {
  it('accepts a normal https link', () => {
    const result = validatePaymentLink('https://buy.stripe.com/abc123')
    expect(result.ok).toBe(true)
  })
  it('rejects http and non-urls', () => {
    expect(validatePaymentLink('http://buy.stripe.com/abc').ok).toBe(false)
    expect(validatePaymentLink('not a link').ok).toBe(false)
    expect(validatePaymentLink('').ok).toBe(false)
  })
  it('rejects anything over 500 characters', () => {
    expect(validatePaymentLink('https://example.com/' + 'x'.repeat(500)).ok).toBe(false)
  })
})

describe('appendStripeReference', () => {
  it('appends ?client_reference_id for Stripe Payment Links', () => {
    expect(appendStripeReference('https://buy.stripe.com/abc', 'JK891P')).toBe(
      'https://buy.stripe.com/abc?client_reference_id=JK891P',
    )
  })
  it('uses & when a query already exists', () => {
    expect(appendStripeReference('https://buy.stripe.com/abc?foo=1', 'JK891P')).toBe(
      'https://buy.stripe.com/abc?foo=1&client_reference_id=JK891P',
    )
  })
  it('leaves other domains untouched', () => {
    expect(appendStripeReference('https://pay.sumup.com/abc', 'JK891P')).toBe(
      'https://pay.sumup.com/abc',
    )
  })
  it('leaves invalid urls untouched', () => {
    expect(appendStripeReference('not-a-url', 'JK891P')).toBe('not-a-url')
  })
})
