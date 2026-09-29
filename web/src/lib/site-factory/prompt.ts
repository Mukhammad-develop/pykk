import type { businesses } from '@/db/schema'
import { DAY_ORDER, moodById, type SiteIntake } from './intake'
import { typeLabel } from './mechanics'
import type { Archetype } from './archetypes'
import type { ChatMessage } from './openrouter'

type Business = typeof businesses.$inferSelect

// Opus's lean creative brief: mostly direction, almost no rules. Everything
// mechanical is injected in code afterwards (see mechanics.ts).
const SYSTEM_PROMPT = `You are the lead designer at a small, excellent UK studio. Local business owners pay you £500+ for a one-page site because yours never look like templates — each one looks like it could only belong to that shop.

Your brief contains: a concept, a design direction, finished facts (prices, hours, story, real reviews), and photo filenames.

How to work:
1. Commit fully to the concept. When in doubt, make the choice that serves the concept, not the safe one.
2. Build the page from a design system: a type scale with dramatic contrast (display type feels confident and large), a spacing rhythm, 2–3 colours used with discipline, and one signature detail a customer would remember.
3. Choose each section's layout for its content. No two consecutive sections share a layout. A beautifully set price list sells more than any illustration. Four prices might become an oversized typographic list; two reviews might become one huge pull quote.
4. AVOID the generic patterns unless the concept truly demands them: rows of three icon cards, alternating grey/white bands, eyebrow labels over every heading, centred-everything layouts.
5. Mobile first: design for a 390px phone held one-handed, where the call and book actions are always within thumb reach. Then let it open up at larger widths.
6. Write with a confident LOCAL voice — "The sharpest fades in Watford", never "Welcome to our website".

Facts: state only what is in the brief. Reviews are verbatim. Never invent years, awards, numbers or credentials. If a claim isn't in the brief, leave it out. Never write the word "subscription" and never mention PYKK's billing.

Output contract — exactly two blocks (plus an optional third):
=== index.html ===
(the file)
=== styles.css ===
(the file)
=== script.js === (optional, vanilla, max 60 lines, no libraries)

Mechanics:
- The <html> tag gets lang="en-GB". The <head> contains, in this order: <meta charset="utf-8">, a viewport meta, <title> with the business name, <link rel="stylesheet" href="styles.css">.
- Where the booking form belongs, place exactly the marker <!--BOOKING--> (only when booking is enabled in the brief). Never build a booking form yourself.
- Where the map belongs, place exactly the marker <!--MAP--> (only when an address is in the brief). Never build a map embed yourself.
- Do NOT add any analytics scripts, beacons, noindex tags, or footer credits — those are injected after you.
- Use EXACTLY the photo filenames given, only in the gallery/hero. Do not invent other image files.

Craft bar (what makes it feel £500): dramatic type contrast, generous negative space, a real grid gallery with hover zoom, hover/focus transitions (150–250ms), a sticky mobile call button when a phone is provided, a two-column footer on desktop.`

export function buildPrompt(
  business: Business,
  intake: SiteIntake,
  publicAppHost: string,
  previousFailures?: string[],
  concept?: string,
  archetype?: Archetype,
): ChatMessage[] {
  const mood = moodById(intake.mood, business.type)
  const hours = DAY_ORDER.map(([key, label]) => `${label}: ${intake.hours[key] || 'not provided'}`).join('\n')
  const services = intake.services.map((s) => `${s.name} — ${s.price ? `£${s.price}` : 'price not provided'}`).join('\n')
  const extras = Object.entries(intake.extras)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
  const reviews = intake.reviews.length > 0
    ? intake.reviews.map((r) => `"${r.text}" — ${r.author}`).join('\n')
    : 'none provided — DO NOT include a reviews section'
  const socials = [
    intake.socials.instagram && `Instagram: ${intake.socials.instagram}`,
    intake.socials.facebook && `Facebook: ${intake.socials.facebook}`,
  ].filter(Boolean).join('\n') || 'none'

  const user = `Business: ${business.name} (a ${typeLabel(business.type)}, slug: ${business.slug})
${archetype ? `DESIGN FOUNDATION "${archetype.label}" — extend it freely, keep its spirit; do NOT rewrite or override it:\n${archetype.conceptHint}\nIts base stylesheet (build on top of this, adding sections and colour roles):\n${archetype.baseCss}\n` : `Design mood "${mood.label}": ${mood.direction}\n`}
Hero photo: ${intake.heroPhoto && intake.photos.length > 0 ? `use images/${intake.photos[0]} as the hero backdrop` : 'no hero backdrop'}
Booking: ${intake.extras.enableBooking ? 'ENABLED — place the <!--BOOKING--> marker where the form belongs' : 'disabled — no <!--BOOKING--> marker'}
Map: ${intake.address ? `place the <!--MAP--> marker (address: ${intake.address})` : 'no address — no <!--MAP--> marker'}
${
  concept
    ? `\nTHE APPROVED ART DIRECTION — commit to it faithfully:\n${concept}\n`
    : ''
}
CONTACT
Owner: ${intake.ownerName || 'not provided'}
Phone: ${intake.phone || 'not provided'}
WhatsApp: ${intake.whatsapp || 'not provided'}
Email: ${intake.email || 'not provided'}
SOCIALS
${socials}

LOCATION
Address: ${intake.address || 'not provided'}
Landmark/town: ${intake.landmark || 'not provided'}

OPENING HOURS
${hours}

SERVICES & PRICES
${services || 'not provided'}

EXTRAS
${extras || 'none'}

STORY
${intake.additionalInfo || 'not provided'}

REAL REVIEWS (use verbatim if present)
${reviews}

PHOTO FILES (use exactly these, in this order)
${intake.photos.length > 0 ? intake.photos.join(', ') : 'none — use placeholder boxes'}

For anything marked "not provided", use a visible [[NEEDS INFO: …]] placeholder — never invent it.
${
  previousFailures && previousFailures.length > 0
    ? `\nYOUR PREVIOUS ATTEMPT WAS REJECTED for these reasons — fix every one:\n- ${previousFailures.join('\n- ')}`
    : ''
}
Now produce the files.`

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: user },
  ]
}

// Pulls the files out of the model's answer (script.js is optional).
export function extractFiles(answer: string): { html: string; css: string; js?: string } | null {
  const htmlMatch = answer.match(/===\s*index\.html\s*===\s*([\s\S]*?)(?====\s*styles\.css\s*===|$)/i)
  const cssMatch = answer.match(/===\s*styles\.css\s*===\s*([\s\S]*?)(?====\s*script\.js\s*===|$)/i)
  if (!htmlMatch || !cssMatch) return null
  const html = htmlMatch[1].trim().replace(/^```\w*\n?/, '').replace(/```$/, '').trim()
  const css = cssMatch[1].trim().replace(/^```\w*\n?/, '').replace(/```$/, '').trim()
  if (!html || !css) return null

  const jsMatch = answer.match(/===\s*script\.js\s*===\s*([\s\S]*?)$/i)
  const js = jsMatch ? jsMatch[1].trim().replace(/^```\w*\n?/, '').replace(/```$/, '').trim() : undefined
  return { html, css, js: js || undefined }
}
