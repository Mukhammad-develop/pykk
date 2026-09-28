import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getDb } from '@/db'
import { settings } from '@/db/schema'
import { apiSession } from '@/lib/auth/guard'
import { logActivity } from '@/lib/auth/activity'
import { originAllowed, clientIpFromHeaders } from '@/lib/request'
import { SETTING_DEFAULTS } from '@/lib/settings'

export const dynamic = 'force-dynamic'

const putSchema = z.object({
  lead_days: z.string().regex(/^\d{1,2}$/).optional(),
  grace_days: z.string().regex(/^\d{1,2}$/).optional(),
  default_price_pence: z.string().regex(/^\d{1,7}$/).optional(),
  client_message_template: z.string().max(1000).optional(),
})

// Update settings (only the keys presented on the More page).
export async function PUT(request: Request) {
  if (!originAllowed(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const session = await apiSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = putSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the values (days must be numbers).' }, { status: 400 })
  }

  const db = getDb()
  for (const [key, value] of Object.entries(parsed.data)) {
    if (value === undefined) continue
    if (!(key in SETTING_DEFAULTS)) continue
    await db
      .insert(settings)
      .values({ key, value })
      .onDuplicateKeyUpdate({ set: { value } })
  }

  await logActivity({
    actor: session.email,
    action: 'settings.updated',
    entity: 'settings',
    after: parsed.data,
    ip: clientIpFromHeaders(request.headers),
  })
  return NextResponse.json({ ok: true })
}
