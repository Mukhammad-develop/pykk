import fs from 'node:fs'
import path from 'node:path'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { businesses } from '@/db/schema'
import { sitesDir } from '@/lib/site-control'
import { logActivity } from '@/lib/auth/activity'
import { generateSite } from './generate'
import { commitAndPushSite } from './git'
import { ensureSubdomain } from './subdomain'
import { renderAdminShell } from './admin-shell'
import { injectMechanics, typeLabel } from './mechanics'
import { FONT_PAIRINGS, copyFonts, fontFaceCss } from './fonts'
import { EMPTY_INTAKE, type SiteIntake } from './intake'

// The full site-factory pipeline for one business. Runs in the background
// (fire-and-forget from the API route); progress is tracked in
// businesses.websiteStatus: building → live | live_fallback | failed.
export async function buildSite(businessId: number): Promise<void> {
  const db = getDb()
  const rows = await db.select().from(businesses).where(eq(businesses.id, businessId)).limit(1)
  const business = rows[0]
  if (!business) return

  const fail = async (note: string) => {
    await db.update(businesses).set({ websiteStatus: 'failed', websiteNote: note.slice(0, 255) }).where(eq(businesses.id, businessId))
    await logActivity({ actor: 'system', action: 'website.build_failed', entity: 'business', entityId: businessId, after: { note } })
  }

  await db.update(businesses).set({ websiteStatus: 'building', websiteNote: null }).where(eq(businesses.id, businessId))

  try {
    const intake: SiteIntake = { ...EMPTY_INTAKE, ...((business.intakeJson as Partial<SiteIntake> | null) ?? {}) }

    // 1. Generate (AI + validator + retry, guaranteed fallback)
    const site = await generateSite(business, intake)

    // 1b. Inject the mechanics in code (beacon, head essentials, footer credit,
    // and the <!--BOOKING--> / <!--MAP--> markers) — the model never sees these.
    const host = (process.env.PUBLIC_APP_HOST || 'admin.pykk.uk').replace(/\/$/, '')
    const htmlWithMechanics = injectMechanics(site.html, {
      slug: business.slug,
      businessName: business.name,
      description: `${business.name} — a local ${typeLabel(business.type)} in the UK.`,
      publicAppHost: host,
      bookingEnabled: Boolean(intake.extras.enableBooking),
      services: intake.services,
      address: intake.address,
    })

    // 2. Write the files (site + the client-area shell at /admin)
    const sitePath = path.join(sitesDir(), business.slug)
    fs.mkdirSync(path.join(sitePath, 'admin'), { recursive: true })
    // The host's nginx caches static files — bust it per build so a rebuild is
    // visible immediately everywhere.
    const bust = `?v=${Date.now()}`
    const htmlToWrite = htmlWithMechanics
      .replace(/href="styles\.css(\?[^"]*)?"/g, `href="styles.css${bust}"`)
      .replace(/src="script\.js(\?[^"]*)?"/g, `src="script.js${bust}"`)
    fs.writeFileSync(path.join(sitePath, 'index.html'), htmlToWrite)

    // Self-hosted fonts for the chosen archetype's family: @font-face rules
    // appended to the stylesheet and the subset files copied into the site.
    const pairing = FONT_PAIRINGS[site.archetype.moodId]
    fs.writeFileSync(path.join(sitePath, 'styles.css'), site.css + fontFaceCss(pairing))
    copyFonts(pairing, sitePath)
    if (site.js) {
      fs.writeFileSync(path.join(sitePath, 'script.js'), site.js)
    } else if (fs.existsSync(path.join(sitePath, 'script.js'))) {
      fs.rmSync(path.join(sitePath, 'script.js')) // no stale script from an older build
    }
    fs.writeFileSync(
      path.join(sitePath, 'admin', 'index.html'),
      renderAdminShell({ slug: business.slug, publicAppHost: host }),
    )

    // 3. Commit + push from the server (reports back if no token)
    const git = await commitAndPushSite(business.slug, `Add site: ${business.name} (site factory)`)

    // 4. Subdomain + SSL via uapi (reports back if unavailable)
    const sub = await ensureSubdomain(business.slug)

    const note = [
      site.usedFallback ? 'fallback template used' : 'AI-drafted',
      git.message,
      sub.message,
    ].join(' · ')

    await db
      .update(businesses)
      .set({
        websiteStatus: site.usedFallback ? 'live_fallback' : 'live',
        websiteBuiltAt: new Date(),
        websiteNote: note.slice(0, 255),
      })
      .where(eq(businesses.id, businessId))

    await logActivity({
      actor: 'system',
      action: 'website.built',
      entity: 'business',
      entityId: businessId,
      after: { usedFallback: site.usedFallback, attempts: site.attempts, steps: site.steps, failures: site.failures.slice(0, 6), note },
    })
  } catch (error) {
    await fail((error as Error).message)
  }
}
