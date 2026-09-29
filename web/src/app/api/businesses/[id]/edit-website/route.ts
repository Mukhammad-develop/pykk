import fs from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses } from '@/db/schema'
import { apiSession } from '@/lib/auth/guard'
import { originAllowed, clientIpFromHeaders } from '@/lib/request'
import { logActivity } from '@/lib/auth/activity'
import { sitesDir } from '@/lib/site-control'
import { injectMechanics, typeLabel } from '@/lib/site-factory/mechanics'
import { extractFiles } from '@/lib/site-factory/prompt'
import { callOpenRouter } from '@/lib/site-factory/openrouter'
import { validateSite } from '@/lib/site-factory/validate'
import { commitAndPushSite } from '@/lib/site-factory/git'
import { EMPTY_INTAKE, type SiteIntake } from '@/lib/site-factory/intake'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  instruction: z.string().trim().min(3).max(500),
})

// "Edit with AI": the founder describes a change ("make the footer dark green"),
// the model applies it surgically to the EXISTING site — no rebuild. Runs in
// the background (long model calls outlive HTTP timeouts); the page polls the
// usual status endpoint for the result.
async function runEdit(
  business: typeof businesses.$inferSelect,
  instruction: string,
  actorEmail: string,
  ip: string | null,
): Promise<void> {
  const db = getDb()
  const indexPath = path.join(sitesDir(), business.slug, 'index.html')
  const cssPath = path.join(sitesDir(), business.slug, 'styles.css')
  const currentHtml = fs.readFileSync(indexPath, 'utf8')
  const currentCss = fs.readFileSync(cssPath, 'utf8')
  const intake: SiteIntake = { ...EMPTY_INTAKE, ...((business.intakeJson as Partial<SiteIntake> | null) ?? {}) }
  const host = (process.env.PUBLIC_APP_HOST || 'admin.pykk.uk').replace(/\/$/, '')

  try {
    const answer = await callOpenRouter(
      [
        {
          role: 'system',
          content: `You are the lead designer at a small, excellent UK studio editing a client's one-page website. You apply EXACTLY the requested change and keep everything else identical. Return the FULL corrected files in this exact format:
=== index.html ===
(the file)
=== styles.css ===
(the file)
No commentary.`,
        },
        {
          role: 'user',
          content: `THE REQUESTED CHANGE (apply ONLY this, keep everything else identical):
"${instruction}"

Keep: the design concept and mood, every fact verbatim, the local voice, the <!--BOOKING--> and <!--MAP--> markers if present, lang="en-GB", all sections, and the output contract. Never write the word "subscription" or mention PYKK's billing.

Business facts (do not alter them): ${business.name}, a ${typeLabel(business.type)}.
Prices: ${intake.services.map((s) => `${s.name} ${s.price ? `£${s.price}` : ''}`).join(', ') || 'n/a'}

THE CURRENT FILES:
=== index.html ===
${currentHtml}
=== styles.css ===
${currentCss}`,
        },
      ],
      { maxTokens: 32000 },
    )

    const edited = extractFiles(answer)
    if (!edited) {
      throw new Error('The AI returned an unreadable answer — nothing was changed.')
    }

    // The current file already carries the injected mechanics, so the edited
    // output will too (the model keeps them) — validate as SHIPPED output after
    // injection (dedupe + marker auto-fix in injectMechanics handles the rest).
    const withMechanics = injectMechanics(edited.html, {
      slug: business.slug,
      businessName: business.name,
      description: `${business.name} — a local ${typeLabel(business.type)} in the UK.`,
      publicAppHost: host,
      bookingEnabled: Boolean(intake.extras.enableBooking),
      services: intake.services,
      address: intake.address,
    })
    const shippedProblems = validateSite(withMechanics, edited.css, { slug: business.slug, publicAppHost: host }, { shipped: true })
    if (shippedProblems.length > 0) {
      throw new Error(`The edit failed the final check (${shippedProblems[0]}) — nothing was changed.`)
    }

    const bust = `?v=${Date.now()}`
    const htmlToWrite = withMechanics
      .replace(/href="styles\.css(\?[^"]*)?"/g, `href="styles.css${bust}"`)
      .replace(/src="script\.js(\?[^"]*)?"/g, `src="script.js${bust}"`)
    fs.writeFileSync(indexPath, htmlToWrite)
    fs.writeFileSync(cssPath, edited.css)
    if (edited.js) {
      fs.writeFileSync(path.join(sitesDir(), business.slug, 'script.js'), edited.js)
    }

    const git = await commitAndPushSite(business.slug, `Edit site: ${business.name} — ${instruction.slice(0, 60)}`)
    await db
      .update(businesses)
      .set({ websiteStatus: 'live', websiteBuiltAt: new Date(), websiteNote: `AI edit applied · ${git.message}` })
      .where(eq(businesses.id, business.id))
    await logActivity({
      actor: actorEmail,
      action: 'website.ai_edit',
      entity: 'business',
      entityId: business.id,
      after: { instruction },
      ip,
    })
  } catch (error) {
    const message = (error as Error).message
    await db
      .update(businesses)
      .set({ websiteStatus: 'live', websiteNote: `AI edit failed: ${message.slice(0, 230)}` })
      .where(eq(businesses.id, business.id))
  }
}

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
    return NextResponse.json({ error: 'Tell me what to change first (a few words).' }, { status: 400 })
  }

  const db = getDb()
  const rows = await db.select().from(businesses).where(eq(businesses.id, Number(id))).limit(1)
  const business = rows[0]
  if (!business) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }
  const indexPath = path.join(sitesDir(), business.slug, 'index.html')
  if (!fs.existsSync(indexPath)) {
    return NextResponse.json({ error: 'No website to edit yet — build it first.' }, { status: 400 })
  }

  await db
    .update(businesses)
    .set({ websiteStatus: 'building', websiteNote: `AI edit: ${parsed.data.instruction.slice(0, 200)}` })
    .where(eq(businesses.id, business.id))

  void runEdit(business, parsed.data.instruction, session.email, clientIpFromHeaders(request.headers)).catch(
    (error) => {
      console.error('[pykk] ai edit crashed:', error)
    },
  )

  return NextResponse.json({ ok: true, status: 'building' })
}
