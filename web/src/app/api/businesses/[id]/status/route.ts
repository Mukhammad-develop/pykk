import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses } from '@/db/schema'
import { apiSession } from '@/lib/auth/guard'
import { logActivity } from '@/lib/auth/activity'
import { originAllowed, clientIpFromHeaders } from '@/lib/request'
import { restoreSite, suspendSite } from '@/lib/site-control'

export const dynamic = 'force-dynamic'

const ACTIONS = ['pause', 'suspend', 'reactivate', 'cancel'] as const
type StatusAction = (typeof ACTIONS)[number]

// Status actions on a business. suspend also turns the site off; reactivate
// brings it back.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const session = await apiSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params
  let action: StatusAction
  try {
    const body = await request.json()
    action = body?.action
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  if (!ACTIONS.includes(action)) {
    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  }

  const db = getDb()
  const rows = await db.select().from(businesses).where(eq(businesses.id, Number(id))).limit(1)
  const business = rows[0]
  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  const before = { status: business.status }
  let siteResult: string | undefined
  let newStatus: string

  if (action === 'suspend') {
    newStatus = 'suspended'
    await db.update(businesses).set({ status: newStatus }).where(eq(businesses.id, business.id))
    siteResult = suspendSite(business.slug)
  } else if (action === 'reactivate') {
    newStatus = 'active'
    await db.update(businesses).set({ status: newStatus }).where(eq(businesses.id, business.id))
    siteResult = restoreSite(business.slug)
  } else if (action === 'pause') {
    newStatus = 'paused'
    await db.update(businesses).set({ status: newStatus }).where(eq(businesses.id, business.id))
  } else {
    newStatus = 'cancelled'
    await db
      .update(businesses)
      .set({ status: newStatus, cancelledAt: new Date().toISOString().slice(0, 10) })
      .where(eq(businesses.id, business.id))
    siteResult = suspendSite(business.slug)
  }

  await logActivity({
    actor: session.email,
    action: `business.${action}`,
    entity: 'business',
    entityId: business.id,
    before,
    after: { status: newStatus, siteResult },
    ip: clientIpFromHeaders(request.headers),
  })

  return NextResponse.json({ ok: true, action, siteResult })
}
