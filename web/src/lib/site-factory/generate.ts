import type { businesses } from '@/db/schema'
import { renderBaselineSite } from './baseline'
import { buildPrompt, extractFiles } from './prompt'
import { buildConceptPrompt, buildCritiquePrompt } from './concept'
import { callOpenRouter } from './openrouter'
import { validateScript, validateSite } from './validate'
import type { SiteIntake } from './intake'

type Business = typeof businesses.$inferSelect

export interface GenerateResult {
  html: string
  css: string
  js?: string
  usedFallback: boolean
  attempts: number
  failures: string[]
  // how long each pipeline step took, for the activity log
  steps: Record<string, number>
}

const SYSTEM_RULES_DIGEST = `static HTML+CSS only (no frameworks/CDNs/webfonts); one h1; semantic landmarks; mobile-first; AA contrast; noindex meta; lang="en-GB"; UK English; no invented facts/reviews/stats; never the word "subscription"; no PYKK-internal/bond content; footer "Website by PYKK" linking https://pykk.uk; beacon <script src="https://HOST/pv.js" data-site="SLUG" defer>; photos only from the provided filenames; booking form only if enabled (with the exact booking.js contract); craft bar: eyebrow labels, section rhythm, depth per mood, map embed when address, sticky mobile call button when phone, hover transitions, two-column footer; #features "Why choose us" icon cards (3–4 cards, each with an inline SVG icon from the catalog); open-now badge from the hours; confident LOCAL voice (never "Welcome to our website").`

// The multi-step pipeline (founder-approved: tokens and build time are cheap):
// art direction → full build → critique-and-rewrite → validate → one retry →
// deterministic baseline as the guaranteed floor.
export async function generateSite(business: Business, intake: SiteIntake): Promise<GenerateResult> {
  const host = (process.env.PUBLIC_APP_HOST || 'admin.pykk.uk').replace(/\/$/, '')
  const ctx = { slug: business.slug, publicAppHost: host }
  const failures: string[] = []

  if (process.env.OPENROUTER_API_KEY) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const steps: Record<string, number> = {}
      try {
        // 1. Art direction for THIS business
        let t0 = Date.now()
        const concept = await callOpenRouter(buildConceptPrompt(business, intake), { maxTokens: 1500 })
        steps[`attempt${attempt}.conceptMs`] = Date.now() - t0

        // 2. Full build against the concept
        t0 = Date.now()
        const answer = await callOpenRouter(
          buildPrompt(business, intake, host, failures.length > 0 ? failures : undefined, concept),
          { maxTokens: 32000 },
        )
        steps[`attempt${attempt}.buildMs`] = Date.now() - t0
        const files = extractFiles(answer)
        if (!files) {
          failures.push(`attempt ${attempt}: could not find the two files in the model's answer`)
          continue
        }

        // 3. Critique-and-rewrite
        t0 = Date.now()
        const critiquedAnswer = await callOpenRouter(
          buildCritiquePrompt(files.html, files.css, concept, SYSTEM_RULES_DIGEST.replace('HOST', host).replace('SLUG', business.slug), failures),
          { maxTokens: 32000 },
        )
        steps[`attempt${attempt}.critiqueMs`] = Date.now() - t0
        const finalFiles = extractFiles(critiquedAnswer) ?? files

        // 4. Validate
        const problems = validateSite(finalFiles.html, finalFiles.css, ctx)
        if (problems.length === 0) {
          let js = finalFiles.js
          if (js) {
            const jsProblems = validateScript(js, host)
            if (jsProblems.length > 0) {
              failures.push(`script.js dropped: ${jsProblems.join(', ')}`)
              js = undefined
            }
          }
          return { ...finalFiles, js, usedFallback: false, attempts: attempt, failures, steps }
        }
        failures.push(...problems.map((p) => `attempt ${attempt}: ${p}`))
      } catch (error) {
        failures.push(`attempt ${attempt}: ${(error as Error).message.slice(0, 200)}`)
      }
    }
  } else {
    failures.push('OPENROUTER_API_KEY is not set')
  }

  const baseline = renderBaselineSite(business, intake, host)
  return { ...baseline, usedFallback: true, attempts: 0, failures, steps: {} }
}
