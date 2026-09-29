import type { SiteIntake } from './intake'
import { renderBookingForm } from './booking-form'
import { escapeHtml } from './baseline'

// Mechanical bits the model must never think about. Everything here is
// injected or substituted in code, deterministically, after generation.

export interface MechanicsContext {
  slug: string
  businessName: string
  description: string
  publicAppHost: string
  bookingEnabled: boolean
  services: SiteIntake['services']
  address: string
}

// Clean, human type labels for prompts and pages ("barber hair" → "barbershop").
export function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    barber_hair: 'barbershop',
    beauty_spa: 'beauty salon',
    cafe: 'café',
    restaurant: 'restaurant',
    cleaning: 'cleaning service',
    laundry: 'laundry service',
    retail: 'local shop',
    local_services: 'local services business',
    other: 'local business',
  }
  return labels[type] ?? 'local business'
}

export function injectMechanics(html: string, ctx: MechanicsContext): string {
  let out = html

  // <head> essentials: charset + viewport + noindex (preview until published).
  if (!/<meta\s+charset/i.test(out)) {
    out = out.replace(/<head>/i, '<head>\n<meta charset="utf-8">')
  }
  if (!/name="viewport"/i.test(out)) {
    out = out.replace(
      /<head>/i,
      '<head>\n<meta name="viewport" content="width=device-width, initial-scale=1">',
    )
  }
  if (!/name="robots"\s+content="noindex"/i.test(out)) {
    out = out.replace(
      /(<meta\s+name="viewport"[^>]*>)/i,
      `$1\n<meta name="robots" content="noindex">`,
    )
  }
  if (!/<meta\s+name="description"/i.test(out) && ctx.description) {
    out = out.replace(
      /(<meta\s+name="robots"[^>]*>)/i,
      `$1\n<meta name="description" content="${escapeHtml(ctx.description)}">`,
    )
  }

  // If the model hand-built a Google Maps embed instead of using the marker,
  // convert it back so the canonical component is used (auto-fix, not reject).
  out = out.replace(/<iframe[^>]*google\.com\/maps[^>]*>(?:\s*<\/iframe>)?/gi, '<!--MAP-->')

  // Markers → real components.
  if (out.includes('<!--BOOKING-->')) {
    const form = ctx.bookingEnabled
      ? renderBookingForm({ slug: ctx.slug, publicAppHost: ctx.publicAppHost, services: ctx.services })
      : ''
    out = out.replace('<!--BOOKING-->', form)
  }
  if (out.includes('<!--MAP-->')) {
    const map = ctx.address
      ? `<iframe class="map" src="https://www.google.com/maps?q=${encodeURIComponent(ctx.address)}&amp;output=embed" loading="lazy" title="Map" referrerpolicy="no-referrer-when-downgrade"></iframe>`
      : ''
    out = out.replace('<!--MAP-->', map)
  }

  // Footer PYKK credit — must exist exactly once.
  const pykkLink = `<a href="https://pykk.uk">PYKK</a>`
  if (!out.includes('href="https://pykk.uk"')) {
    if (out.includes('</footer>')) {
      out = out.replace('</footer>', `  <p>Website by ${pykkLink}</p>\n</footer>`)
    } else {
      out = out.replace('</main>', `</main>\n<footer>\n  <p>Website by ${pykkLink}</p>\n</footer>`)
    }
  }

  // Beacon, always last before </body>.
  if (!out.includes('/pv.js')) {
    out = out.replace(
      '</body>',
      `<script src="https://${ctx.publicAppHost}/pv.js" data-site="${ctx.slug}" defer></script>\n</body>`,
    )
  }

  return out
}
