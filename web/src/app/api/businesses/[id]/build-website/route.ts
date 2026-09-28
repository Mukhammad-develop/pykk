import { NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses } from '@/db/schema'
import { apiSession } from '@/lib/auth/guard'
import { originAllowed } from '@/lib/request'
import { buildSite } from '@/lib/site-factory/build'

export const dynamic = 'force-dynamic'

// A build whose status has been "building" for this long is orphaned — the app
// process that was running it has died (shared-host restarts/squeezes).
const STALE_BUILD_MS = 15 * 60 * 1000

function isStale(business: { websiteStatus: string; updatedAt: Date }): boolean {
  return business.websiteStatus === 'building' && business.updatedAt.getTime() < Date.now() - STALE_BUILD_MS
}

// Kick off a website build in the background. The business page polls
// GET /api/businesses/[id] for the result.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!originAllowed(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const session = await apiSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params
  const businessId = Number(id)
  const db = getDb()
  const rows = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1)
  const business = rows[0]
  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }
  if (business.websiteStatus === 'building' && !isStale(business)) {
    return NextResponse.json({ error: 'A build is already running.' }, { status: 409 })
  }

  // Fire and forget — progress is tracked in businesses.websiteStatus.
  void buildSite(businessId).catch((error) => {
    console.error('[pykk] site build crashed:', error)
  })

  return NextResponse.json({ ok: true, status: 'building' })
}

// The business page polls this for build progress. Also the watchdog: a
// "building" status older than 15 minutes is marked failed automatically.
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await apiSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }
  const { id } = await params
  const db = getDb()
  const rows = await db.select().from(businesses).where(eq(businesses.id, Number(id))).limit(1)
  const business = rows[0]
  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  if (isStale(business)) {
    const note = 'Build interrupted — the app process restarted. Press Rebuild.'
    await db
      .update(businesses)
      .set({ websiteStatus: 'failed', websiteNote: note })
      .where(eq(businesses.id, business.id))
    return NextResponse.json({ websiteStatus: 'failed', websiteBuiltAt: business.websiteBuiltAt, websiteNote: note })
  }

  return NextResponse.json({
    websiteStatus: business.websiteStatus,
    websiteBuiltAt: business.websiteBuiltAt,
    websiteNote: business.websiteNote,
  })
}
