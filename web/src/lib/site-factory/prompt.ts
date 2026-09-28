import type { businesses } from '@/db/schema'
import { DAY_ORDER, moodById, type SiteIntake } from './intake'
import type { ChatMessage } from './openrouter'

type Business = typeof businesses.$inferSelect

const SYSTEM_PROMPT = `You are the PYKK website factory. You produce ONE complete, production-ready small-business website as exactly two files: index.html and styles.css. No explanations, no markdown fences with language tags other than exactly these two blocks:

=== index.html ===
(the file)
=== styles.css ===
(the file)

ABSOLUTE RULES (a validator checks every one — failing any means rejection):
1. Static HTML5 + one CSS file. No frameworks, no JavaScript, no CDNs, no webfonts, no image downloads — system font stacks only.
2. Exactly one <h1>. Semantic landmarks (header, nav, main, section, footer) and a visually-hidden skip link. Mobile-first CSS, no horizontal scrolling at 360px. WCAG AA contrast (4.5:1). Tap targets at least 44px. Visible :focus-visible styles.
3. <head> in this order: <meta charset="utf-8">, viewport, <meta name="robots" content="noindex">, <title> with the business name, meta description, <link rel="stylesheet" href="styles.css">. The <html> tag has lang="en-GB".
4. UK English. NO invented facts: no fake reviews, testimonials, ratings, awards, "years of experience", or statistics. Only the facts provided in the intake. Reviews may appear ONLY if explicitly provided as real in the intake — use them verbatim, never write new ones.
5. The public site sells the BUSINESS only. NEVER mention PYKK's billing, bonds, payments, grace periods, websites being turned off, or anything PYKK-internal — and NEVER the word "subscription". The only PYKK presence is the footer credit and the beacon (rules 8 and 9).
6. Sections in this order: hero (business name, one honest tagline from the story, CTA to #contact; if a hero photo is provided, use it as a large backdrop image with a readable dark overlay); #services (services & prices from the intake, formatted £X.XX); #gallery (the provided photo files as <img src="images/FILENAME" loading="lazy"> with honest alt text; if no photos, use styled placeholder boxes captioned [[NEEDS INFO: photos]]); #reviews (ONLY if real reviews are provided — a "What customers say" section quoting them verbatim with the given names); #about (the story from the intake, expanded warmly but factually); #book (ONLY when booking is enabled — see rule 10); #visit (opening-hours table + address + a "Get directions" Google Maps link); #contact (click-to-call tel:, mailto:, a WhatsApp https://wa.me/<digits> link, and any provided Instagram/Facebook links); footer.
7. Footer: "© {business name} · Website by <a href="https://pykk.uk">PYKK</a>".
8. Immediately before </body>: <script src="https://PUBLIC_APP_HOST/pv.js" data-site="SLUG" defer></script>
9. Gallery images: use EXACTLY the photo filenames given. Do not invent other image files.
10. When booking is enabled, the #book section must contain a form with id="booking-form" and data attributes data-slug="SLUG" and data-api="https://PUBLIC_APP_HOST", with fields named exactly: service (a <select> of the intake services), date (type="date"), time (a <select> with half-hour options 09:00–19:30), name, phone, note — followed by <p id="booking-error" hidden></p>, <p id="booking-success" hidden>Booked! We’ll confirm shortly — see you soon.</p>, a submit button with class "booking-submit", and the script tag <script src="https://PUBLIC_APP_HOST/booking.js" defer></script>. Never handle the booking yourself — that script does everything.
11. CRAFT BAR — this is what separates an agency site from a template. Every one of these is expected:
    a. The hero is NOT just a title: an eyebrow/kicker line (small-caps label, e.g. the town or business type), a strong headline, one supporting sentence, and a primary CTA. A provided hero photo fills the hero with a readable dark overlay.
    b. Section rhythm: alternate section backgrounds (page bg vs a subtly different surface), generous vertical padding, a centered max-width container, and each section header has a small eyebrow label above the h2 (e.g. "PRICES", "GALLERY", "VISIT US").
    c. Real depth per the mood: shadows/borders/radius exactly as the mood specifies — never flat default boxes.
    d. Gallery: a proper grid (2–3 columns on desktop), images with object-fit: cover and a subtle hover zoom transition.
    e. #visit embeds Google Maps when an address is provided: <iframe src="https://www.google.com/maps?q=URL_ENCODED_ADDRESS&output=embed" loading="lazy" title="Map" style="border:0"> — full width, ~300px tall, rounded per the mood — in ADDITION to the directions link.
    f. When a phone number is provided, add a sticky mobile call button: <a class="sticky-call" href="tel:…">Call {business name}</a>, position: fixed at the bottom, visible ONLY on screens under 640px, high z-index, the accent colour.
    g. The footer has two columns on desktop (left: business name + the PYKK credit; right: quick contact links) and stacks on mobile.
    h. Hover/focus transitions of 150–250ms ease on interactive elements.
12. OPTIONAL third block === script.js === (vanilla, max 60 lines, no libraries, no external URLs): only if it clearly improves the page — e.g. a mobile nav toggle or a simple gallery lightbox. Omit it otherwise.`

export function buildPrompt(
  business: Business,
  intake: SiteIntake,
  publicAppHost: string,
  previousFailures?: string[],
  concept?: string,
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

  const user = `Business: ${business.name} (type: ${business.type.replace(/_/g, ' ')}, slug: ${business.slug})
Design mood "${mood.label}": ${mood.direction}
Public app host for the beacon: ${publicAppHost}
Hero photo: ${intake.heroPhoto && intake.photos.length > 0 ? `use images/${intake.photos[0]} as the hero backdrop` : 'no hero backdrop'}
Booking section: ${intake.extras.enableBooking ? 'ENABLED — include it per rule 10' : 'disabled — do NOT include any booking form'}
${
  concept
    ? `\nTHE APPROVED ART DIRECTION — follow it faithfully (it satisfies the craft bar):\n${concept}\n`
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

STORY / ABOUT
${intake.additionalInfo || 'not provided'}

REAL REVIEWS (client-supplied — use verbatim if present)
${reviews}

PHOTO FILES (use exactly these in the gallery, in this order)
${intake.photos.length > 0 ? intake.photos.join(', ') : 'none — use placeholder boxes'}

For anything marked "not provided", use a visible [[NEEDS INFO: …]] placeholder — never invent it.
${
  previousFailures && previousFailures.length > 0
    ? `\nYOUR PREVIOUS ATTEMPT WAS REJECTED for these reasons — fix every one:\n- ${previousFailures.join('\n- ')}`
    : ''
}
Now produce the two files.`

  return [
    { role: 'system', content: SYSTEM_PROMPT.replace('PUBLIC_APP_HOST', publicAppHost).replace('SLUG', business.slug) },
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
