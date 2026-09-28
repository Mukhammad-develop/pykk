import { NextResponse } from 'next/server'
import { z } from 'zod'
import { and, eq, gte, ne } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings, businesses } from '@/db/schema'
import { corsPreflight, withCors } from '@/lib/cors'
import { clientIpFromHeaders } from '@/lib/request'
import { isSlotBookable, nowLondon, slotToUtcIso } from '@/lib/booking'
import { EMPTY_INTAKE, type SiteIntake } from '@/lib/site-factory/intake'
import { logActivity } from '@/lib/auth/activity'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  slug: z.string().trim().toLowerCase().min(1),
  service: z.string().trim().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(5).max(40),
  note: z.string().trim().max(500).optional().or(z.literal('')),
})

const MAX_BOOKINGS_PER_IP_PER_HOUR = 10

export async function OPTIONS(request: Request) {
  return corsPreflight(request)
}

// The website booking form posts here (from {slug}.pykk.uk, CORS-locked).
export async function POST(request: Request) {
  const fail = (status: number, error: string) =>
    withCors(request, NextResponse.json({ error }, { status }))

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return fail(400, 'Something went wrong — please try again.')
  }
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return fail(400, 'Please fill in every field and try again.')
  }
  const input = parsed.data
  const ip = clientIpFromHeaders(request.headers)

  // Rate limit: 10 bookings per IP per hour.
  const db = getDb()
  if (ip) {
    const recent = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(eq(bookings.ip, ip), gte(bookings.createdAt, new Date(Date.now() - 60 * 60 * 1000))))
      .limit(MAX_BOOKINGS_PER_IP_PER_HOUR + 1)
    if (recent.length > MAX_BOOKINGS_PER_IP_PER_HOUR) {
      return fail(429, 'Too many bookings — please try again later or call us.')
    }
  }

  const rows = await db.select().from(businesses).where(eq(businesses.slug, input.slug)).limit(1)
  const business = rows[0]
  if (!business) return fail(404, 'Not found.')

  const intake = { ...EMPTY_INTAKE, ...((business.intakeJson as Partial<SiteIntake> | null) ?? {}) }
  if (!intake.extras.enableBooking) {
    return fail(400, 'Online booking is not available here — please call instead.')
  }
  const serviceNames = intake.services.map((s) => s.name)
  if (!serviceNames.includes(input.service)) {
    return fail(400, 'Unknown service — please pick one from the list.')
  }

  // Availability: opening hours, future, not already taken.
  const taken = await db
    .select({ startsAt: bookings.startsAt })
    .from(bookings)
    .where(
      and(
        eq(bookings.businessId, business.id),
        ne(bookings.status, 'cancelled'),
        gte(bookings.startsAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
      ),
    )
  const takenStarts = taken.map((r) => r.startsAt.toISOString())
  const verdict = isSlotBookable(intake.hours, { date: input.date, time: input.time }, takenStarts, nowLondon())
  if (!verdict.ok) {
    return fail(409, verdict.reason)
  }

  await db.insert(bookings).values({
    businessId: business.id,
    startsAt: new Date(slotToUtcIso(input.date, input.time)),
    status: 'pending',
    source: 'online',
    customerName: input.name,
    customerPhone: input.phone,
    service: input.service,
    note: input.note || null,
    ip,
  })

  await logActivity({
    actor: 'online',
    action: 'booking.created',
    entity: 'business',
    entityId: business.id,
    after: { service: input.service, date: input.date, time: input.time, name: input.name },
    ip,
  })

  return withCors(request, NextResponse.json({ ok: true }))
}
