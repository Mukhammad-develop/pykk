import type { businesses } from '@/db/schema'
import { renderBaselineSite } from './baseline'
import { buildPrompt, extractFiles } from './prompt'
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
}

// Drafts a site with the AI, validates it, retries once with the errors fed
// back, and falls back to the deterministic baseline renderer — so every call
// returns a complete, shippable site.
export async function generateSite(business: Business, intake: SiteIntake): Promise<GenerateResult> {
  const host = (process.env.PUBLIC_APP_HOST || 'admin.pykk.uk').replace(/\/$/, '')
  const ctx = { slug: business.slug, publicAppHost: host }
  const failures: string[] = []

  if (process.env.OPENROUTER_API_KEY) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const answer = await callOpenRouter(buildPrompt(business, intake, host, failures.length > 0 ? failures : undefined))
        const files = extractFiles(answer)
        if (!files) {
          failures.push(`attempt ${attempt}: could not find the two files in the model's answer`)
          continue
        }
        const problems = validateSite(files.html, files.css, ctx)
        if (problems.length === 0) {
          // script.js is optional and only accepted if it stays tiny and local
          let js = files.js
          if (js) {
            const jsProblems = validateScript(js, host)
            if (jsProblems.length > 0) {
              failures.push(`script.js dropped: ${jsProblems.join(', ')}`)
              js = undefined
            }
          }
          return { ...files, js, usedFallback: false, attempts: attempt, failures }
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
  return { ...baseline, usedFallback: true, attempts: 0, failures }
}
