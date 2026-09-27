import type { businesses } from '@/db/schema'
import { DAY_ORDER, type SiteIntake } from './intake'

// The guaranteed floor of the site factory: a complete, correct, honest site
// rendered deterministically from the intake. Used when the AI drafting fails
// or is disabled — every save ships a working site.

type Business = typeof businesses.$inferSelect

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^+\d]/g, '')}`
}

function waHref(whatsapp: string): string {
  return `https://wa.me/${whatsapp.replace(/[^\d]/g, '')}`
}

export function renderBaselineSite(
  business: Business,
  intake: SiteIntake,
  publicAppHost: string,
): { html: string; css: string } {
  const e = escapeHtml
  const name = e(business.name)
  const slug = business.slug

  const serviceRows = intake.services.length > 0
    ? intake.services
        .map(
          (s) => `          <li class="price-row"><span>${e(s.name)}</span><span class="leader"></span><span class="price">${s.price ? `£${e(s.price)}` : ''}</span></li>`,
        )
        .join('\n')
    : '          <li class="price-row"><span>[[NEEDS INFO: services & prices]]</span></li>'

  const hourRows = DAY_ORDER.map(([key, label]) => {
    const value = intake.hours[key] || '[[NEEDS INFO: hours]]'
    return `          <tr><th>${label}</th><td>${value === 'closed' ? 'Closed' : e(value)}</td></tr>`
  }).join('\n')

  const photos = intake.photos.length > 0
    ? intake.photos
        .map(
          (p, i) =>
            `          <figure><img src="images/${e(p)}" alt="${name} — photo ${i + 1}" loading="lazy"></figure>`,
        )
        .join('\n')
    : '          <div class="photo-placeholder">[[NEEDS INFO: photos]]</div>'

  const extraLines: string[] = []
  if (intake.extras.barberMode) {
    extraLines.push(
      intake.extras.barberMode === 'walk-ins'
        ? 'Walk-ins welcome.'
        : intake.extras.barberMode === 'appointments'
          ? 'By appointment — book ahead.'
          : 'Walk-ins and appointments.',
    )
  }
  if (intake.extras.appointmentOnly) extraLines.push('By appointment only.')
  if (intake.extras.cafeService) {
    extraLines.push(
      intake.extras.cafeService === 'both' ? 'Eat in or takeaway.' : intake.extras.cafeService === 'eat-in' ? 'Eat in.' : 'Takeaway.',
    )
  }
  if (intake.extras.areasCovered) extraLines.push(`Covering ${e(intake.extras.areasCovered)}.`)
  if (intake.extras.callOut) extraLines.push(e(intake.extras.callOut))

  const contactItems: string[] = []
  if (intake.phone) contactItems.push(`          <a class="btn btn--primary" href="${telHref(intake.phone)}">Call ${e(intake.phone)}</a>`)
  if (intake.whatsapp) contactItems.push(`          <a class="btn" href="${waHref(intake.whatsapp)}">WhatsApp us</a>`)
  if (intake.email) contactItems.push(`          <a class="btn" href="mailto:${e(intake.email)}">${e(intake.email)}</a>`)
  if (contactItems.length === 0) contactItems.push('          <p>[[NEEDS INFO: contact details]]</p>')

  const addressBlock = intake.address
    ? `<p class="address">${e(intake.address)}</p>
          <a class="directions" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(intake.address)}" target="_blank" rel="noreferrer">Get directions ↗</a>`
    : `<p class="address">[[NEEDS INFO: address]]${intake.landmark ? ` (${e(intake.landmark)})` : ''}</p>`

  const aboutText = intake.additionalInfo
    ? e(intake.additionalInfo)
    : `${name} is a friendly local ${business.type.replace(/_/g, ' ')}. ${extraLines.join(' ')}`

  const html = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${name}</title>
<meta name="description" content="${name} — a local ${business.type.replace(/_/g, ' ')} in the UK. Services, prices, opening hours and contact.">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <p class="brand">${name}</p>
  <nav aria-label="Main">
    <a href="#services">Services</a>
    <a href="#gallery">Gallery</a>
    <a href="#visit">Visit</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
<section class="hero" aria-label="Welcome">
  <h1>${name}</h1>
  <p class="tagline">${extraLines.length > 0 ? e(extraLines.join(' ')) : `A friendly local ${business.type.replace(/_/g, ' ')}.`}</p>
  <a class="btn btn--primary" href="#contact">Get in touch</a>
</section>
<main id="main">
  <section id="services" aria-labelledby="services-heading">
    <h2 id="services-heading">Services &amp; prices</h2>
    <ul class="price-list">
${serviceRows}
    </ul>
  </section>
  <section id="gallery" aria-labelledby="gallery-heading">
    <h2 id="gallery-heading">Gallery</h2>
    <div class="gallery-grid">
${photos}
    </div>
  </section>
  <section id="about" aria-labelledby="about-heading">
    <h2 id="about-heading">About</h2>
    <p>${aboutText}</p>
  </section>
  <section id="visit" aria-labelledby="visit-heading">
    <h2 id="visit-heading">Opening hours &amp; location</h2>
    <table class="hours">
${hourRows}
    </table>
${addressBlock}
  </section>
  <section id="contact" aria-labelledby="contact-heading">
    <h2 id="contact-heading">Contact</h2>
    <div class="contact-actions">
${contactItems.join('\n')}
    </div>
  </section>
  <section id="bond" aria-labelledby="bond-heading" class="bond">
    <h2 id="bond-heading">Your bond with PYKK</h2>
    <p>This website is looked after by <a href="https://pykk.uk">PYKK</a> for a small monthly bond. That covers the website itself, hosting, updates and support. Each month we send a secure pay link by message, and paying it keeps the website online. If a bill stays unpaid after a short grace period, the website is temporarily turned off until it’s paid. To change anything about your bond, just contact PYKK.</p>
  </section>
</main>
<footer>
  <p>© ${name} · Website by <a href="https://pykk.uk">PYKK</a></p>
</footer>
<script src="https://${publicAppHost}/pv.js" data-site="${slug}" defer></script>
</body>
</html>
`

  const css = `* { box-sizing: border-box; margin: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: #10150f; color: #eef2ea; line-height: 1.6;
}
.skip-link { position: absolute; left: -999px; }
.skip-link:focus { left: 1rem; top: 1rem; background: #d8e6c3; color: #10150f; padding: .5rem 1rem; z-index: 10; }
.site-header {
  display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 2px solid #33402a;
}
.brand { font-weight: 800; letter-spacing: .04em; }
.site-header nav { display: flex; gap: 1rem; }
.site-header a { color: #cfe0bd; text-decoration: none; padding: .5rem 0; }
.site-header a:focus-visible, a:focus-visible { outline: 3px solid #d8e6c3; outline-offset: 2px; }
.hero { padding: 3.5rem 1.25rem 2.5rem; text-align: center; border-bottom: 1px solid #33402a; }
.hero h1 { font-size: clamp(2rem, 7vw, 3.2rem); line-height: 1.1; }
.tagline { color: #b8c9a6; margin: .75rem auto 1.5rem; max-width: 34rem; }
.btn {
  display: inline-block; padding: .8rem 1.4rem; border-radius: .5rem; font-weight: 700;
  background: transparent; color: #eef2ea; border: 2px solid #d8e6c3; text-decoration: none;
}
.btn--primary { background: #d8e6c3; color: #10150f; border-color: #d8e6c3; }
main { max-width: 44rem; margin: 0 auto; padding: 0 1.25rem 3rem; }
section { padding: 2.25rem 0 0; }
h2 { font-size: 1.35rem; margin-bottom: 1rem; border-bottom: 2px solid #33402a; padding-bottom: .4rem; }
.price-list { list-style: none; padding: 0; }
.price-row { display: flex; align-items: baseline; gap: .75rem; padding: .55rem 0; border-bottom: 1px dashed #3a4730; }
.price-row .leader { flex: 1; border-bottom: 2px dotted #4a5a3c; transform: translateY(-4px); }
.price-row .price { font-weight: 700; white-space: nowrap; }
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: .75rem; }
.gallery-grid figure, .photo-placeholder {
  aspect-ratio: 4/3; background: #1c2417; border: 1px solid #33402a; border-radius: .5rem; overflow: hidden;
  display: grid; place-items: center; color: #7d8b76; font-size: .85rem; text-align: center; padding: .5rem;
}
.gallery-grid img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hours { width: 100%; max-width: 22rem; border-collapse: collapse; }
.hours th, .hours td { text-align: left; padding: .4rem 0; border-bottom: 1px solid #26301e; }
.hours td { text-align: right; color: #cfe0bd; }
.address { margin-top: 1rem; color: #cfe0bd; }
.directions { display: inline-block; margin-top: .5rem; color: #d8e6c3; padding: .5rem 0; }
.contact-actions { display: flex; flex-direction: column; gap: .75rem; }
.contact-actions .btn { text-align: center; padding: .9rem; }
.bond { margin-top: 2.25rem; border: 2px solid #33402a; border-radius: .75rem; padding: 1.25rem; background: #16201200; }
.bond h2 { border: none; padding: 0; }
.bond p { color: #b8c9a6; font-size: .95rem; }
.bond a { color: #d8e6c3; }
footer { text-align: center; color: #7d8b76; font-size: .85rem; padding: 2rem 1rem; border-top: 1px solid #33402a; }
footer a { color: #d8e6c3; }
@media (min-width: 40rem) { .contact-actions { flex-direction: row; flex-wrap: wrap; } }
`

  return { html, css }
}
