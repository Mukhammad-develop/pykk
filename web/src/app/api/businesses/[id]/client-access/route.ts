import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses, clientUsers } from '@/db/schema'
import { apiSession } from '@/lib/auth/guard'
import { hashPassword } from '@/lib/auth/password'
import { logActivity } from '@/lib/auth/activity'
import { originAllowed, clientIpFromHeaders } from '@/lib/request'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(10).max(100),
})

// Founder: create or reset the client's login for {slug}.pykk.uk/admin.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Password needs at least 10 characters.' }, { status: 400 })
  }

  const db = getDb()
  const rows = await db.select().from(businesses).where(eq(businesses.id, Number(id))).limit(1)
  const business = rows[0]
  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  // One login per business: update if the email matches, otherwise replace.
  const email = parsed.data.email
  const passwordHash = await hashPassword(parsed.data.password)
  const existing = await db
    .select()
    .from(clientUsers)
    .where(eq(clientUsers.businessId, business.id))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(clientUsers)
      .set({ email, passwordHash, active: 1 })
      .where(eq(clientUsers.businessId, business.id))
  } else {
    // The email must be unique across all client users
    const clash = await db.select().from(clientUsers).where(eq(clientUsers.email, email)).limit(1)
    if (clash.length > 0) {
      return NextResponse.json({ error: 'That email is already used for another client.' }, { status: 409 })
    }
    await db.insert(clientUsers).values({ businessId: business.id, email, passwordHash })
  }

  await logActivity({
    actor: session.email,
    action: 'client.access_set',
    entity: 'business',
    entityId: business.id,
    after: { email },
    ip: clientIpFromHeaders(request.headers),
  })

  return NextResponse.json({ ok: true, email, adminUrl: `https://${business.slug}.pykk.uk/admin` })
}

// Whether access exists (email only — never the password).
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await apiSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const { id } = await params
  const db = getDb()
  const rows = await db.select({ email: clientUsers.email }).from(clientUsers).where(eq(clientUsers.businessId, Number(id))).limit(1)
  return NextResponse.json({ email: rows[0]?.email ?? null })
}
