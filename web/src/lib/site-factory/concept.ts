import type { businesses } from '@/db/schema'
import { moodById, type SiteIntake } from './intake'
import type { ChatMessage } from './openrouter'

type Business = typeof businesses.$inferSelect

// Step 1 of the multi-step pipeline: a compact art direction for THIS business.
// Its output feeds the main generation as "the approved concept — follow it".
export function buildConceptPrompt(business: Business, intake: SiteIntake): ChatMessage[] {
  const mood = moodById(intake.mood, business.type)
  return [
    {
      role: 'system',
      content:
        'You are an award-winning web art director for UK local businesses. You design one-page sites that win clients, not templates. Be concrete and decisive. No generic advice.',
    },
    {
      role: 'user',
      content: `Create the art direction for a one-page website.
Business: ${business.name} (${business.type.replace(/_/g, ' ')})
Mood requested: "${mood.label}" — ${mood.direction}
Story: ${intake.additionalInfo || 'not provided'}
Photos available: ${intake.photos.length}${intake.heroPhoto ? ' (one will be the hero backdrop)' : ''}
Takes bookings: ${intake.extras.enableBooking ? 'yes' : 'no'}

Answer in at most 180 words, exactly these fields:
HERO VARIANT: one of [full-bleed photo hero | split hero (text left, photo right) | editorial centered hero] — pick what suits the photos and mood.
TYPOGRAPHY: heading + body system stacks and the scale relationship (e.g. huge condensed display vs calm serif).
LAYOUT: the section sequence that sells THIS business best (from: services/prices, gallery, reviews, about, booking, visit, contact) and why in one line.
DISTINCTIVE DETAILS: exactly 3 concrete craft details (e.g. "price table as a dark ruled ledger", "gallery as a 2-col masonry with zoom hover", "quote-sized serif reviews").
COLOUR SYSTEM: bg, surface, text, muted, accent, accent-text as hex — tuned to the mood but to THIS business.`,
    },
  ]
}

// Step 3: critique-and-rewrite. Returns the corrected files (or null to keep the original).
export function buildCritiquePrompt(
  html: string,
  css: string,
  concept: string,
  rules: string,
  previousFailures: string[],
): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are the most demanding design QA in the industry. You review one-page sites for UK local businesses. You fix anything that is not excellent, then return the FULL corrected files in this exact format:
=== index.html ===
(corrected file)
=== styles.css ===
(corrected file)
No commentary. If the site is already excellent, return the files unchanged.`,
    },
    {
      role: 'user',
      content: `Review this site against:
1) THE RULES (all must hold):
${rules}
2) THE ART DIRECTION (it should be faithfully executed):
${concept}
${previousFailures.length > 0 ? `3) THESE FAILURES MUST BE FIXED:\n- ${previousFailures.join('\n- ')}` : ''}

Weak craft is a failure too: flat sections, default-looking boxes, missing eyebrow labels, weak hero, cramped spacing, missing hover transitions, missing map embed when an address exists, missing sticky call button when a phone exists.

THE SITE TO REVIEW:
=== index.html ===
${html}
=== styles.css ===
${css}`,
    },
  ]
}
