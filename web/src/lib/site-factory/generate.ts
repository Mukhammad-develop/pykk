import type { businesses } from '@/db/schema'
import { renderBaselineSite } from './baseline'
import { buildPrompt, extractFiles } from './prompt'
import { buildConceptPrompt, buildCritiquePrompt } from './concept'
import { callOpenRouter } from './openrouter'
import { validateScript, validateSite } from './validate'
import { archetypeById, type Archetype } from './archetypes'
import type { SiteIntake } from './intake'

type Business = typeof businesses.$inferSelect

export interface GenerateResult {
  html: string
  css: string
  js?: string
  usedFallback: boolean
  attempts: number
  failures: string[]
  archetype: Archetype
  council: { applied: string[]; skipped: { model: string; reason: string }[] }
  // how long each pipeline step took, for the activity log
  steps: Record<string, number>
}

// The multi-step pipeline (founder-approved: tokens and build time are cheap):
// one-sentence concept → full build → taste critique → validate → one retry →
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

        // 1b. Choose the archetype the concept picked (or the type default).
        const archetype = archetypeById(concept.match(/ARCHETYPE:\s*([a-z-]+)/i)?.[1], business.type)

        // 2. Full build against the concept + the design foundation
        t0 = Date.now()
        const answer = await callOpenRouter(
          buildPrompt(business, intake, host, failures.length > 0 ? failures : undefined, concept, archetype),
          { maxTokens: 32000 },
        )
        steps[`attempt${attempt}.buildMs`] = Date.now() - t0
        const files = extractFiles(answer)
        if (!files) {
          failures.push(`attempt ${attempt}: could not find the two files in the model's answer`)
          continue
        }

        // 3. Critique-and-rewrite (taste + concept fidelity)
        t0 = Date.now()
        const critiquedAnswer = await callOpenRouter(
          buildCritiquePrompt(files.html, files.css, concept, failures),
          { maxTokens: 32000 },
        )
        steps[`attempt${attempt}.critiqueMs`] = Date.now() - t0
        const finalFiles = extractFiles(critiquedAnswer) ?? files

        // 4. Validate
        const problems = validateSite(finalFiles.html, finalFiles.css, ctx)
        if (problems.length === 0) {
          // 4b. The model council: Opus, Kimi K3 and GPT-6 Astra each review
          // and surgically fix the site in turn (skips gracefully on errors).
          t0 = Date.now()
          let councilInfo: { applied: string[]; skipped: { model: string; reason: string }[] } = { applied: [], skipped: [] }
          try {
            const { runCouncil } = await import('./council')
            const council = await runCouncil(finalFiles, { business, intake, concept, host, slug: business.slug })
            finalFiles.html = council.html
            finalFiles.css = council.css
            if (council.js) finalFiles.js = council.js
            councilInfo = { applied: council.applied, skipped: council.skipped }
          } catch (error) {
            councilInfo.skipped.push({ model: 'council', reason: (error as Error).message.slice(0, 120) })
          }
          steps[`attempt${attempt}.councilMs`] = Date.now() - t0

          // 5. The eyes: render + taste-critique + one revision (best effort,
          // skipped silently when no browser/vision is available).
          t0 = Date.now()
          try {
            const { lookAndCritique } = await import('./eyes')
            const eyes = await lookAndCritique(finalFiles.html, finalFiles.css)
            if (eyes) {
              const revisionAnswer = await callOpenRouter(
                [
                  ...buildPrompt(business, intake, host, undefined, concept, archetype),
                  {
                    role: 'user',
                    content: `A senior designer looked at the rendered page (desktop + mobile screenshots) and demands these visual fixes — apply every one WITHOUT breaking anything and WITHOUT touching the markers:\n${eyes.critique}\n\nHere are the files to revise:\n=== index.html ===\n${finalFiles.html}\n=== styles.css ===\n${finalFiles.css}`,
                  },
                ],
                { maxTokens: 32000 },
              )
              const revised = extractFiles(revisionAnswer)
              if (revised && validateSite(revised.html, revised.css, ctx).length === 0) {
                finalFiles.html = revised.html
                finalFiles.css = revised.css
                if (revised.js) finalFiles.js = revised.js
              }
            }
          } catch (error) {
            failures.push(`eyes pass skipped: ${(error as Error).message.slice(0, 120)}`)
          }
          steps[`attempt${attempt}.eyesMs`] = Date.now() - t0

          let js = finalFiles.js
          if (js) {
            const jsProblems = validateScript(js, host)
            if (jsProblems.length > 0) {
              failures.push(`script.js dropped: ${jsProblems.join(', ')}`)
              js = undefined
            }
          }
          return { ...finalFiles, js, usedFallback: false, attempts: attempt, failures, archetype, council: councilInfo, steps }
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
  return { ...baseline, usedFallback: true, attempts: 0, failures, archetype: archetypeById(undefined, business.type), council: { applied: [], skipped: [] }, steps: {} }
}
