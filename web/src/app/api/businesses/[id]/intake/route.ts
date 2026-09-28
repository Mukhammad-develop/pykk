import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses } from '@/db/schema'
import { apiSession } from '@/lib/auth/guard'
import { logActivity } from '@/lib/auth/activity'
import { originAllowed, clientIpFromHeaders } from '@/lib/request'

export const dynamic = 'force-dynamic'

const intakeSchema = z.object({
  ownerName: z.string().trim().max(160).default(''),
  phone: z.string().trim().max(40).default(''),
  whatsapp: z.string().trim().max(40).default(''),
  email: z.string().trim().max(320).default(''),
  address: z.string().trim().max(255).default(''),
  landmark: z.string().trim().max(160).default(''),
  hours: z.record(z.string(), z.string().trim().max(40)).default({}),
  services: z.array(z.object({ name: z.string().trim().min(1).max(120), price: z.string().trim().max(20) })).max(30).default([]),
  additionalInfo: z.string().trim().max(3000).default(''),
  mood: z.enum(['dark-bold', 'light-elegant', 'warm-rustic', 'bright-practical']).or(z.literal('')).default(''),
  reviews: z.array(z.object({
    author: z.string().trim().min(1).max(80),
    text: z.string().trim().min(1).max(300),
  })).max(3).default([]),
  socials: z.object({
    instagram: z.string().trim().max(200).default(''),
    facebook: z.string().trim().max(200).default(''),
  }).default({ instagram: '', facebook: '' }),
  heroPhoto: z.boolean().default(false),
  extras: z.object({
    barberMode: z.enum(['walk-ins', 'appointments', 'both']).optional(),
    appointmentOnly: z.boolean().optional(),
    cafeService: z.enum(['eat-in', 'takeaway', 'both']).optional(),
    areasCovered: z.string().trim().max(255).optional(),
    callOut: z.string().trim().max(255).optional(),
  }).default({}),
  photos: z.array(z.string().trim().max(120)).max(20).default([]),
})

// Save the website intake for a business.
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
  const parsed = intakeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please check the form and try again.' }, { status: 400 })
  }

  const db = getDb()
  const rows = await db.select().from(businesses).where(eq(businesses.id, Number(id))).limit(1)
  if (!rows[0]) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  await db.update(businesses).set({ intakeJson: parsed.data }).where(eq(businesses.id, rows[0].id))
  await logActivity({
    actor: session.email,
    action: 'website.intake_saved',
    entity: 'business',
    entityId: rows[0].id,
    after: { services: parsed.data.services.length, photos: parsed.data.photos.length },
    ip: clientIpFromHeaders(request.headers),
  })

  return NextResponse.json({ ok: true })
}
