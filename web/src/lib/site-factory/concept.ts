import type { businesses } from '@/db/schema'
import { moodById, type SiteIntake } from './intake'
import { typeLabel } from './mechanics'
import type { ChatMessage } from './openrouter'

type Business = typeof businesses.$inferSelect

// Stage 1 of the pipeline: a REAL concept — one sentence that makes the site
// belong to this shop, not a form to fill in (Opus).
export function buildConceptPrompt(business: Business, intake: SiteIntake): ChatMessage[] {
  const mood = moodById(intake.mood, business.type)
  return [
    {
      role: 'system',
      content:
        'You are an award-winning web art director for UK local businesses. You have exactly one job here: give the page its IDEA — one sentence that makes it belong to this shop. Everything else follows from that sentence. Be decisive and specific. Example of the standard: "The price list is the hero, set like a 1960s barbershop board, because Marco\'s prices are his pitch."',
    },
    {
      role: 'user',
      content: `Business: ${business.name} (a ${typeLabel(business.type)}${intake.landmark ? ` in ${intake.landmark}` : ''})
Mood requested: "${mood.label}" — ${mood.direction}
Story: ${intake.additionalInfo || 'not provided'}
Photos: ${intake.photos.length}${intake.heroPhoto ? ' (one will be the hero backdrop)' : ''}
Takes bookings: ${intake.extras.enableBooking ? 'yes' : 'no'}

Answer in at most 140 words, exactly these fields:
ARCHETYPE: one of [heritage-barber | luxe-beauty | cafe-menu | clean-services] — pick the closest starting point, adapted freely.
THE IDEA: one sentence — the concept that makes this site belong to THIS shop.
HERO ELEMENT: the single thing that leads the page (a photo, the price board, the owner, or the headline) and why.
TYPE: a type scale relationship (e.g. huge condensed display vs calm serif body) — dramatic contrast.
PALETTE: 3 colours + 1 neutral with roles (page, surface, text, accent), hex values tuned to the mood.
SIGNATURE: one motif or detail a customer would remember.
SECTION PLAN: the section sequence, where NO two consecutive sections share a layout, and the ONE thing each section does with its content.`,
    },
  ]
}

// Stage 3: critique for TASTE and concept fidelity (not rules — those are
// enforced deterministically by the validator).
export function buildCritiquePrompt(
  html: string,
  css: string,
  concept: string,
  previousFailures: string[],
): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are the most demanding design director in the country, reviewing a one-page site for a paying local business. You judge TASTE and CONCEPT FIDELITY, never compliance. Fix anything that feels weak, then return the FULL corrected files in this exact format:
=== index.html ===
(corrected file)
=== styles.css ===
(corrected file)
No commentary. If the site is already excellent, return the files unchanged.`,
    },
    {
      role: 'user',
      content: `THE CONCEPT (the site must embody it):
${concept}
${previousFailures.length > 0 ? `\nTHE VALIDATOR REJECTED THE PREVIOUS VERSION FOR:\n- ${previousFailures.join('\n- ')}\nFix every one.` : ''}

Ask of every section: does this feel crafted for THIS business, or like a template? Kill filler copy, dead space, flat hierarchy, repetitive layouts, and any of these generic patterns (rows of three icon cards, alternating grey/white bands, eyebrows over every heading, centred-everything). Keep the booking/map markers <!--BOOKING--> and <!--MAP--> exactly as they are if present. Keep the lang="en-GB" attribute. Keep every fact verbatim.

THE SITE:
=== index.html ===
${html}
=== styles.css ===
${css}`,
    },
  ]
}
