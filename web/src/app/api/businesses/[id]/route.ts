import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses } from '@/db/schema'
import { apiSession } from '@/lib/auth/guard'
import { logActivity } from '@/lib/auth/activity'
import { originAllowed, clientIpFromHeaders } from '@/lib/request'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  pricePence: z.number().int().min(0).max(1000000).optional(),
  notes: z.string().max(5000).optional(),
})

// Edit a business: monthly price (applies from the next bill) and notes.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const session = await apiSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid values.' }, { status: 400 })
  }

  const db = getDb()
  const rows = await db.select().from(businesses).where(eq(businesses.id, Number(id))).limit(1)
  const business = rows[0]
  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const updates: Record<string, unknown> = {}
  const before: Record<string, unknown> = {}
  if (parsed.data.pricePence !== undefined && parsed.data.pricePence !== business.pricePence) {
    updates.pricePence = parsed.data.pricePence
    before.pricePence = business.pricePence
  }
  if (parsed.data.notes !== undefined && parsed.data.notes !== (business.notes ?? '')) {
    updates.notes = parsed.data.notes || null
    before.notes = business.notes
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, changed: false })
  }

  await db.update(businesses).set(updates).where(eq(businesses.id, business.id))
  await logActivity({
    actor: session.email,
    action: 'business.updated',
    entity: 'business',
    entityId: business.id,
    before,
    after: updates,
    ip: clientIpFromHeaders(request.headers),
  })

  return NextResponse.json({ ok: true, changed: true })
}
