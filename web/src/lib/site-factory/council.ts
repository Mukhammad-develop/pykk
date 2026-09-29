import type { businesses } from '@/db/schema'
import type { SiteIntake } from './intake'
import { extractFiles } from './prompt'
import { callModel } from './openrouter'
import { validateSite } from './validate'

type Business = typeof businesses.$inferSelect

export interface CouncilResult {
  html: string
  css: string
  js?: string
  applied: string[]
  skipped: { model: string; reason: string }[]
}

// The model council (founder's idea): after a build, each council model in turn
// reviews and surgically fixes the site. Every pass is validated — a model that
// errors or breaks validation is skipped and the last good version kept.
export async function runCouncil(
  files: { html: string; css: string; js?: string },
  opts: { business: Business; intake: SiteIntake; concept: string; host: string; slug: string },
): Promise<CouncilResult> {
  const models = (process.env.COUNCIL_MODELS ||
    '~anthropic/claude-opus-latest,moonshotai/kimi-k3,openai/gpt-6-astra')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean)

  const applied: string[] = []
  const skipped: { model: string; reason: string }[] = []
  let current = { ...files }
  const shortName = (model: string) => model.split('/').pop() ?? model

  for (const model of models) {
    try {
      const answer = await callModel(
        model,
        [
          {
            role: 'system',
            content: `You are ${shortName(model)}, a world-class reviewer of small-business websites. Another model built this one-page site for a UK local business. Review it hard and return the FULL corrected files in this exact format:
=== index.html ===
(the file)
=== styles.css ===
(the file)
Surgical fixes only — never a wholesale rewrite.`,
          },
          {
            role: 'user',
            content: `THE CONCEPT the site must embody:
${opts.concept}

FACTS it may use (anything else is invented and must go):
Business: ${opts.business.name} (${opts.business.slug})
Services/prices: ${opts.intake.services.map((s) => `${s.name} ${s.price ? `£${s.price}` : ''}`).join(', ') || 'none'}
Hours: ${JSON.stringify(opts.intake.hours)}
Story: ${opts.intake.additionalInfo || 'not provided'}
Reviews: ${opts.intake.reviews.map((r) => `"${r.text}" — ${r.author}`).join('; ') || 'none'}

Review for: factual slips (remove anything not in the facts), broken or duplicated content, weak copy, accessibility issues, layout/CSS problems, and anything that smells like a free template. Keep: the <!--BOOKING--> and <!--MAP--> markers, lang="en-GB", every fact verbatim, the local confident voice, and the concept's mood.

THE SITE:
=== index.html ===
${current.html}
=== styles.css ===
${current.css}`,
          },
        ],
        { maxTokens: 32000 },
      )

      const revised = extractFiles(answer)
      if (!revised) {
        skipped.push({ model, reason: 'unreadable answer' })
        continue
      }
      const problems = validateSite(revised.html, revised.css, { slug: opts.slug, publicAppHost: opts.host })
      if (problems.length > 0) {
        skipped.push({ model, reason: `produced invalid output: ${problems[0]}` })
        continue
      }
      current = { html: revised.html, css: revised.css, js: revised.js ?? current.js }
      applied.push(shortName(model))
    } catch (error) {
      skipped.push({ model, reason: (error as Error).message.slice(0, 120) })
    }
  }

  return { ...current, applied, skipped }
}
