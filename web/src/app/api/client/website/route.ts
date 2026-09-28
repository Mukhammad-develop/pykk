import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses } from '@/db/schema'
import { getClientAuth } from '@/lib/auth/client'
import { corsPreflight, withCors } from '@/lib/cors'
import { logActivity } from '@/lib/auth/activity'
import { buildSite } from '@/lib/site-factory/build'
import { EMPTY_INTAKE, type SiteIntake } from '@/lib/site-factory/intake'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request: Request) {
  return corsPreflight(request)
}

const editableSchema = z.object({
  hours: z.record(z.string(), z.string().trim().max(40)),
  reviews: z.array(z.object({
    author: z.string().trim().min(1).max(80),
    text: z.string().trim().min(1).max(300),
  })).max(3),
  additionalInfo: z.string().trim().max(3000),
  services: z.array(z.object({ name: z.string().trim().min(1).max(120), price: z.string().trim().max(20) })).max(30),
})

function intakeOf(business: typeof businesses.$inferSelect): SiteIntake {
  return {
    ...EMPTY_INTAKE,
    ...((business.intakeJson as Partial<SiteIntake> | null) ?? {}),
    extras: { ...EMPTY_INTAKE.extras, ...((business.intakeJson as Partial<SiteIntake> | null)?.extras ?? {}) },
    socials: { ...EMPTY_INTAKE.socials, ...((business.intakeJson as Partial<SiteIntake> | null)?.socials ?? {}) },
  }
}

// The client's "Website info" section: read and edit the easily-changed
// content (hours, reviews, story, services & prices). Saving regenerates the
// site automatically through the same factory pipeline.
export async function GET(request: Request) {
  const auth = await getClientAuth(request)
  if (!auth) {
    return withCors(request, NextResponse.json({ error: 'Unauthorised' }, { status: 401 }))
  }
  const intake = intakeOf(auth.business)
  return withCors(
    request,
    NextResponse.json({
      hours: intake.hours,
      reviews: intake.reviews,
      additionalInfo: intake.additionalInfo,
      services: intake.services,
      websiteStatus: auth.business.websiteStatus,
    }),
  )
}

export async function PUT(request: Request) {
  const auth = await getClientAuth(request)
  if (!auth) {
    return withCors(request, NextResponse.json({ error: 'Unauthorised' }, { status: 401 }))
  }
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return withCors(request, NextResponse.json({ error: 'Invalid request.' }, { status: 400 }))
  }
  const parsed = editableSchema.safeParse(body)
  if (!parsed.success) {
    return withCors(request, NextResponse.json({ error: 'Please check the values and try again.' }, { status: 400 }))
  }

  const { business, clientUser } = auth
  const intake = intakeOf(business)
  const updated: SiteIntake = {
    ...intake,
    hours: parsed.data.hours,
    reviews: parsed.data.reviews,
    additionalInfo: parsed.data.additionalInfo,
    services: parsed.data.services,
  }

  const db = getDb()
  await db.update(businesses).set({ intakeJson: updated }).where(eq(businesses.id, business.id))
  await logActivity({
    actor: `client:${business.slug}`,
    action: 'client.website_info_updated',
    entity: 'business',
    entityId: business.id,
    after: { by: clientUser.email },
  })

  // Regenerate the site in the background with the new content.
  void buildSite(business.id).catch((error) => {
    console.error('[pykk] rebuild after client edit crashed:', error)
  })

  return withCors(request, NextResponse.json({ ok: true, websiteStatus: 'building' }))
}
