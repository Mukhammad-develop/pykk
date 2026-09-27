// The URL a client opens to see and pay a bill.
// Lives on the public app host (the admin host on this server — the fallback).
export function clientPayUrl(reference: string, clientToken: string): string {
  const host = (process.env.PUBLIC_APP_HOST || 'admin.pykk.uk').replace(/\/$/, '')
  return `https://${host}/pay/${reference}?t=${encodeURIComponent(clientToken)}`
}
