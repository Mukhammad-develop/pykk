import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { costs } from '@/db/schema'
import { apiSession } from '@/lib/auth/guard'
import { logActivity } from '@/lib/auth/activity'
import { originAllowed, clientIpFromHeaders } from '@/lib/request'

export const dynamic = 'force-dynamic'

const addSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  category: z.enum(['hosting', 'sim_plan', 'sms_api', 'ai', 'domain', 'other']),
  amountPence: z.number().int().min(0).max(10000000),
  note: z.string().trim().max(255).optional().or(z.literal('')),
})

// The founder's monthly costs (feed the profit number on the Stats page).
export async function POST(request: Request) {
  if (!originAllowed(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const session = await apiSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = addSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the values.' }, { status: 400 })
  }

  const db = getDb()
  await db.insert(costs).values({
    month: parsed.data.month,
    category: parsed.data.category,
    amountPence: parsed.data.amountPence,
    note: parsed.data.note || null,
  })
  await logActivity({
    actor: session.email,
    action: 'cost.added',
    entity: 'cost',
    after: parsed.data,
    ip: clientIpFromHeaders(request.headers),
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!originAllowed(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const session = await apiSession()
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const id = Number(new URL(request.url).searchParams.get('id'))
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 })

  const db = getDb()
  const rows = await db.select().from(costs).where(eq(costs.id, id)).limit(1)
  await db.delete(costs).where(eq(costs.id, id))
  await logActivity({
    actor: session.email,
    action: 'cost.deleted',
    entity: 'cost',
    entityId: id,
    before: rows[0] ?? null,
    ip: clientIpFromHeaders(request.headers),
  })
  return NextResponse.json({ ok: true })
}
