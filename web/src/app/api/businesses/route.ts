import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, payments, BUSINESS_TYPES, PAID_METHODS } from '@/db/schema'
import { apiSession } from '@/lib/auth/guard'
import { logActivity } from '@/lib/auth/activity'
import { originAllowed, clientIpFromHeaders } from '@/lib/request'
import { isValidSlug } from '@/lib/slug'
import { nextDueAfter } from '@/lib/billing'
import { uniqueReference } from '@/lib/reference'
import { getSettingNumber } from '@/lib/settings'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().toLowerCase(),
  type: z.enum(BUSINESS_TYPES),
  ownerName: z.string().trim().max(160).optional().or(z.literal('')),
  ownerEmail: z.string().trim().toLowerCase().email().optional().or(z.literal('')),
  ownerPhone: z.string().trim().max(40).optional().or(z.literal('')),
  pricePence: z.number().int().min(0).max(1000000).optional(),
  firstPaymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  firstPaymentMethod: z.enum(PAID_METHODS),
  notes: z.string().trim().max(5000).optional().or(z.literal('')),
})

export async function POST(request: Request) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const session = await apiSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the form and try again.' }, { status: 400 })
  }
  const input = parsed.data

  if (!isValidSlug(input.slug)) {
    return NextResponse.json(
      { error: 'That slug is invalid or reserved. Use 3–40 chars: a–z, 0–9, hyphens.' },
      { status: 400 },
    )
  }

  const db = getDb()
  const clash = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.slug, input.slug))
    .limit(1)
  if (clash.length > 0) {
    return NextResponse.json({ error: `The slug "${input.slug}" is already taken.` }, { status: 409 })
  }

  const pricePence = input.pricePence ?? (await getSettingNumber('default_price_pence', 499))
  const anchor = input.firstPaymentDate

  await db.insert(businesses).values({
    name: input.name,
    slug: input.slug,
    type: input.type,
    ownerName: input.ownerName || null,
    ownerEmail: input.ownerEmail || null,
    ownerPhone: input.ownerPhone || null,
    status: 'active',
    pricePence,
    billingAnchorDate: anchor,
    startedAt: anchor,
    notes: input.notes || null,
  })
  const created = await db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, input.slug))
    .limit(1)
  const business = created[0]

  // The first month is paid in person at signup; it anchors all future bills.
  const reference = await uniqueReference(async (ref) => {
    const rows = await db
      .select({ id: payments.id })
      .from(payments)
      .where(eq(payments.reference, ref))
      .limit(1)
    return rows.length > 0
  })
  await db.insert(payments).values({
    businessId: business.id,
    reference,
    periodStart: anchor,
    periodEnd: nextDueAfter(anchor, anchor),
    dueDate: anchor,
    amountPence: pricePence,
    status: 'paid',
    paidAt: anchor,
    paidMethod: input.firstPaymentMethod,
    clientToken: randomBytes(32).toString('base64url'),
  })

  await logActivity({
    actor: session.email,
    action: 'business.created',
    entity: 'business',
    entityId: business.id,
    after: { name: business.name, slug: business.slug, pricePence, anchor },
    ip: clientIpFromHeaders(request.headers),
  })

  return NextResponse.json({ ok: true, id: business.id, slug: business.slug })
}
