import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { settings } from '@/db/schema'

// Default values — the database row wins when it exists.
export const SETTING_DEFAULTS: Record<string, string> = {
  lead_days: '7',
  grace_days: '7',
  default_price_pence: '499',
  allowed_link_domains:
    'buy.stripe.com, checkout.stripe.com, pay.sumup.com, paypal.me, www.paypal.com, monzo.me',
  client_message_template:
    'Hi {owner_name}, your PYKK payment #{reference} for {business_name} (£{amount}) is due on {due_date_long}. You can pay securely here: {client_pay_url}. Thank you!',
  daily_summary_enabled: 'false',
}

export async function getSetting(key: string): Promise<string> {
  const db = getDb()
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1)
  return rows[0]?.value ?? SETTING_DEFAULTS[key] ?? ''
}

export async function getSettingNumber(key: string, fallback: number): Promise<number> {
  const value = Number(await getSetting(key))
  return Number.isFinite(value) && value > 0 ? value : fallback
}

// Inserts any missing defaults (runs at server start; never overwrites).
export async function ensureSettingsSeeded(): Promise<void> {
  const db = getDb()
  const existing = await db.select({ key: settings.key }).from(settings)
  const present = new Set(existing.map((r) => r.key))
  const missing = Object.entries(SETTING_DEFAULTS).filter(([key]) => !present.has(key))
  if (missing.length > 0) {
    await db.insert(settings).values(missing.map(([key, value]) => ({ key, value })))
  }
}
