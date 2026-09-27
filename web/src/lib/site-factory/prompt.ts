import type { businesses } from '@/db/schema'
import { DAY_ORDER, type SiteIntake } from './intake'
import type { ChatMessage } from './openrouter'

type Business = typeof businesses.$inferSelect

const DESIGN_DIRECTIONS: Record<string, string> = {
  barber_hair:
    'Dark, masculine, sharp: near-black background #14110d, warm off-white text #ede6da, amber accent #d9a441. Condensed uppercase headings, sharp corners, ruled price table with dotted leaders.',
  beauty_spa:
    'Light, calm, elegant spa: cream background #faf6f1, deep plum-grey text #43333a, dusty rose accent #a4576b, soft sage secondary #7d8b76. Georgia serif headings, generous whitespace, 18px-radius cards, pill buttons.',
  cafe: 'Warm, rustic, appetising: paper background #f8f2e4, dark brown text #3b2a1e, forest green accent #33573c, terracotta secondary #b0502a. Georgia serif, dotted leaders in the menu, dashed section rules, stamp-style bordered CTA.',
  restaurant:
    'Warm, rustic, appetising: paper background #f8f2e4, dark brown text #3b2a1e, forest green accent #33573c, terracotta secondary #b0502a. Georgia serif, dotted leaders in the menu, dashed section rules, stamp-style bordered CTA.',
  cleaning:
    'Bright, practical, trustworthy: white background, navy text #12283f, strong blue accent #0b5cab (white text on it), warm yellow #f2b705 highlights on dark areas only. Helvetica/Arial, cards with a 4px left accent border, big tap targets.',
  laundry:
    'Bright, practical, trustworthy: white background, navy text #12283f, strong blue accent #0b5cab (white text on it), warm yellow #f2b705 highlights on dark areas only. Helvetica/Arial, cards with a 4px left accent border, big tap targets.',
  retail:
    'Bright, practical, trustworthy: white background, navy text #12283f, strong blue accent #0b5cab (white text on it), warm yellow #f2b705 highlights on dark areas only. Helvetica/Arial, cards with a 4px left accent border, big tap targets.',
  local_services:
    'Bright, practical, trustworthy: white background, navy text #12283f, strong blue accent #0b5cab (white text on it), warm yellow #f2b705 highlights on dark areas only. Helvetica/Arial, cards with a 4px left accent border, big tap targets.',
  other:
    'Clean, neutral, professional: very dark green-grey background #10150f, warm off-white text #eef2ea, soft green accent #d8e6c3. System sans, simple cards, dotted leaders in the price list.',
}

const SYSTEM_PROMPT = `You are the PYKK website factory. You produce ONE complete, production-ready small-business website as exactly two files: index.html and styles.css. No explanations, no markdown fences with language tags other than exactly these two blocks:

=== index.html ===
(the file)
=== styles.css ===
(the file)

ABSOLUTE RULES (a validator checks every one — failing any means rejection):
1. Static HTML5 + one CSS file. No frameworks, no JavaScript, no CDNs, no webfonts, no image downloads — system font stacks only.
2. Exactly one <h1>. Semantic landmarks (header, nav, main, section, footer) and a visually-hidden skip link. Mobile-first CSS, no horizontal scrolling at 360px. WCAG AA contrast (4.5:1). Tap targets at least 44px. Visible :focus-visible styles.
3. <head> in this order: <meta charset="utf-8">, viewport, <meta name="robots" content="noindex">, <title> with the business name, meta description, <link rel="stylesheet" href="styles.css">. The <html> tag has lang="en-GB".
4. UK English. NO invented facts: no fake reviews, testimonials, ratings, awards, "years of experience", or statistics. Only the facts provided in the intake.
5. NEVER the word "subscription" anywhere (not even in comments). The monthly payment relationship is called a "bond".
6. Sections in this order: hero (business name, one honest tagline, CTA to #contact); #services (services & prices — every price from the intake, formatted £X.XX); #gallery (the provided photo files as <img src="images/FILENAME" loading="lazy"> with honest alt text; if no photos, use styled placeholder boxes captioned [[NEEDS INFO: photos]]); #about; #visit (opening-hours table + address + a "Get directions" Google Maps link); #contact (click-to-call tel:, mailto:, and a WhatsApp https://wa.me/<digits> link); a "Your bond with PYKK" section; footer.
7. The bond section explains in plain warm English: the website is looked after by PYKK for a small monthly bond covering the website, hosting, updates and support; each month PYKK sends a secure pay link by message and paying keeps the website online; if a bill stays unpaid after a short grace period the website is temporarily turned off until paid; contact PYKK to change anything. Link "PYKK" to https://pykk.uk. Never a hard-coded payment link.
8. Footer: "© {business name} · Website by <a href="https://pykk.uk">PYKK</a>".
9. Immediately before </body>: <script src="https://PUBLIC_APP_HOST/pv.js" data-site="SLUG" defer></script>
10. Gallery images: use EXACTLY the photo filenames given. Do not invent other image files.`

export function buildPrompt(
  business: Business,
  intake: SiteIntake,
  publicAppHost: string,
  previousFailures?: string[],
): ChatMessage[] {
  const hours = DAY_ORDER.map(([key, label]) => `${label}: ${intake.hours[key] || 'not provided'}`).join('\n')
  const services = intake.services.map((s) => `${s.name} — ${s.price ? `£${s.price}` : 'price not provided'}`).join('\n')
  const extras = Object.entries(intake.extras)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  const user = `Business: ${business.name} (type: ${business.type.replace(/_/g, ' ')}, slug: ${business.slug})
Design direction: ${DESIGN_DIRECTIONS[business.type] ?? DESIGN_DIRECTIONS.other}
Public app host for the beacon: ${publicAppHost}

CONTACT
Owner: ${intake.ownerName || 'not provided'}
Phone: ${intake.phone || 'not provided'}
WhatsApp: ${intake.whatsapp || 'not provided'}
Email: ${intake.email || 'not provided'}

LOCATION
Address: ${intake.address || 'not provided'}
Landmark/town: ${intake.landmark || 'not provided'}

OPENING HOURS
${hours}

SERVICES & PRICES
${services || 'not provided'}

EXTRAS
${extras || 'none'}

ABOUT / ADDITIONAL INFO
${intake.additionalInfo || 'not provided'}

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

// Pulls the two files out of the model's answer.
export function extractFiles(answer: string): { html: string; css: string } | null {
  const htmlMatch = answer.match(/===\s*index\.html\s*===\s*([\s\S]*?)(?====\s*styles\.css\s*===|$)/i)
  const cssMatch = answer.match(/===\s*styles\.css\s*===\s*([\s\S]*?)$/i)
  if (!htmlMatch || !cssMatch) return null
  const html = htmlMatch[1].trim().replace(/^```\w*\n?/, '').replace(/```$/, '').trim()
  const css = cssMatch[1].trim().replace(/^```\w*\n?/, '').replace(/```$/, '').trim()
  if (!html || !css) return null
  return { html, css }
}
