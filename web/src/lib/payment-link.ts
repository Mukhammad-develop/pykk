import { z } from 'zod'

// Founder decision: no allowed-domain list (single admin). A link must be
// https and at most 500 characters.
const linkSchema = z
  .string()
  .trim()
  .max(500)
  .url()
  .startsWith('https://', { message: 'The link must start with https://' })

export function validatePaymentLink(url: string): { ok: true; url: string } | { ok: false; error: string } {
  const parsed = linkSchema.safeParse(url)
  if (!parsed.success) {
    return { ok: false, error: 'The link must be a valid https:// address (max 500 characters).' }
  }
  return { ok: true, url: parsed.data }
}

// Stripe Payment Links can carry our reference so the optional webhook (a later
// phase) can mark the bill paid automatically.
export function appendStripeReference(url: string, reference: string): string {
  let host = ''
  try {
    host = new URL(url).hostname
  } catch {
    return url
  }
  if (host !== 'buy.stripe.com') return url
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}client_reference_id=${encodeURIComponent(reference)}`
}
