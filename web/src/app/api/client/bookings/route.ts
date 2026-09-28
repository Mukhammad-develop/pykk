import { NextResponse } from 'next/server'
import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings } from '@/db/schema'
import { getClientAuth } from '@/lib/auth/client'
import { corsPreflight, withCors } from '@/lib/cors'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request: Request) {
  return corsPreflight(request)
}

// The client's bookings list (read-only for now; actions arrive with the
// website booking form phase).
export async function GET(request: Request) {
  const auth = await getClientAuth(request)
  if (!auth) {
    return withCors(request, NextResponse.json({ error: 'Unauthorised' }, { status: 401 }))
  }
  const db = getDb()
  const rows = await db
    .select()
    .from(bookings)
    .where(eq(bookings.businessId, auth.business.id))
    .orderBy(asc(bookings.startsAt))
    .limit(100)

  return withCors(request, NextResponse.json({ bookings: rows }))
}
