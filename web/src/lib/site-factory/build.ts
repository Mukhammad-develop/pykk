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

    // 2. Write the files
    const sitePath = path.join(sitesDir(), business.slug)
    fs.mkdirSync(sitePath, { recursive: true })
    fs.writeFileSync(path.join(sitePath, 'index.html'), site.html)
    fs.writeFileSync(path.join(sitePath, 'styles.css'), site.css)

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
      after: { usedFallback: site.usedFallback, attempts: site.attempts, failures: site.failures.slice(0, 6), note },
    })
  } catch (error) {
    await fail((error as Error).message)
  }
}
