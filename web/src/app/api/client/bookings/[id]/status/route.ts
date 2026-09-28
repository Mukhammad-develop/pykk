import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings, BOOKING_STATUSES, type BookingStatus } from '@/db/schema'
import { getClientAuth } from '@/lib/auth/client'
import { corsPreflight, withCors } from '@/lib/cors'
import { logActivity } from '@/lib/auth/activity'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request: Request) {
  return corsPreflight(request)
}

// The client manages their bookings: confirm, cancel, complete, no-show.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getClientAuth(request)
  if (!auth) {
    return withCors(request, NextResponse.json({ error: 'Unauthorised' }, { status: 401 }))
  }

  const { id } = await params
  let action: BookingStatus
  try {
    const body = await request.json()
    action = body?.action
  } catch {
    return withCors(request, NextResponse.json({ error: 'Invalid request.' }, { status: 400 }))
  }
  if (!BOOKING_STATUSES.includes(action)) {
    return withCors(request, NextResponse.json({ error: 'Unknown action.' }, { status: 400 }))
  }

  const db = getDb()
  const rows = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, Number(id)), eq(bookings.businessId, auth.business.id)))
    .limit(1)
  const booking = rows[0]
  if (!booking) {
    return withCors(request, NextResponse.json({ error: 'Booking not found' }, { status: 404 }))
  }

  await db.update(bookings).set({ status: action }).where(eq(bookings.id, booking.id))
  await logActivity({
    actor: `client:${auth.business.slug}`,
    action: `booking.${action}`,
    entity: 'booking',
    entityId: booking.id,
    before: { status: booking.status },
    after: { status: action },
  })

  return withCors(request, NextResponse.json({ ok: true, status: action }))
}
