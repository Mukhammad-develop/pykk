import type { businesses } from '@/db/schema'
import { DAY_ORDER, moodById, type MoodId, type SiteIntake } from './intake'
import { renderBookingForm, BOOKING_CSS } from './booking-form'
import { FEATURE_CARDS, iconSvg } from './icons'

// The guaranteed floor of the site factory: a complete, correct, honest site
// rendered deterministically from the intake, in the client's chosen mood.
// Used when the AI drafting fails or is disabled — every save ships a working site.

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

interface MoodPalette {
  bg: string
  text: string
  muted: string
  accent: string
  accentText: string
  surface: string
  line: string
  headingFont: string
  headingTransform: string
}

const PALETTES: Record<MoodId, MoodPalette> = {
  'dark-bold': {
    bg: '#14110d', text: '#ede6da', muted: '#b3a88f', accent: '#d9a441', accentText: '#14110d',
    surface: '#1c1913', line: '#3a3324', headingFont: "'Avenir Next Condensed','Arial Narrow',sans-serif",
    headingTransform: 'uppercase',
  },
  'light-elegant': {
    bg: '#faf6f1', text: '#43333a', muted: '#7d6470', accent: '#a4576b', accentText: '#ffffff',
    surface: '#ffffff', line: '#e3d9d2', headingFont: "Georgia,'Times New Roman',serif",
    headingTransform: 'none',
  },
  'warm-rustic': {
    bg: '#f8f2e4', text: '#3b2a1e', muted: '#7a6450', accent: '#33573c', accentText: '#f8f2e4',
    surface: '#fffaf0', line: '#d9cbb4', headingFont: "Georgia,'Times New Roman',serif",
    headingTransform: 'none',
  },
  'bright-practical': {
    bg: '#ffffff', text: '#12283f', muted: '#546b85', accent: '#0b5cab', accentText: '#ffffff',
    surface: '#f5f8fc', line: '#d7e2ee', headingFont: "Helvetica,Arial,sans-serif",
    headingTransform: 'none',
  },
}

export function renderBaselineSite(
  business: Business,
  intake: SiteIntake,
  publicAppHost: string,
): { html: string; css: string } {
  const e = escapeHtml
  const name = e(business.name)
  const slug = business.slug
  const mood = moodById(intake.mood, business.type)
  const palette = PALETTES[mood.id]
  const heroPhoto = intake.heroPhoto && intake.photos.length > 0 ? intake.photos[0] : null

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

  const reviewBlocks =
    intake.reviews.length > 0
      ? `  <section id="reviews" aria-labelledby="reviews-heading">
    <h2 id="reviews-heading">What customers say</h2>
    <div class="reviews">
${intake.reviews
  .map(
    (r) => `      <blockquote>
        <p>“${e(r.text)}”</p>
        <footer>— ${e(r.author)}</footer>
      </blockquote>`,
  )
  .join('\n')}
    </div>
  </section>`
      : ''

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
  if (intake.socials.instagram) contactItems.push(`          <a class="btn" href="${e(intake.socials.instagram)}" target="_blank" rel="noreferrer">Instagram ↗</a>`)
  if (intake.socials.facebook) contactItems.push(`          <a class="btn" href="${e(intake.socials.facebook)}" target="_blank" rel="noreferrer">Facebook ↗</a>`)
  if (contactItems.length === 0) contactItems.push('          <p>[[NEEDS INFO: contact details]]</p>')

  const addressBlock = intake.address
    ? `<p class="address">${e(intake.address)}</p>
          <a class="directions" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(intake.address)}" target="_blank" rel="noreferrer">Get directions ↗</a>
          <iframe class="map" src="https://www.google.com/maps?q=${encodeURIComponent(intake.address)}&amp;output=embed" loading="lazy" title="Map" referrerpolicy="no-referrer-when-downgrade"></iframe>`
    : `<p class="address">[[NEEDS INFO: address]]${intake.landmark ? ` (${e(intake.landmark)})` : ''}</p>`

  const aboutText = intake.additionalInfo
    ? e(intake.additionalInfo)
    : `${name} is a friendly local ${business.type.replace(/_/g, ' ')}. ${extraLines.join(' ')}`

  const cards = FEATURE_CARDS[business.type] ?? FEATURE_CARDS.other
  const featureCards = cards
    .map(
      (card, i) => `      <div class="feature-card">
        ${iconSvg(card.icon)}
        <h3>${e(card.title)}</h3>
        ${extraLines[i] ? `<p>${e(extraLines[i])}</p>` : ''}
      </div>`,
    )
    .join('\n')

  const hoursJson = JSON.stringify(intake.hours).replace(/</g, '\\u003c')
  const openNowScript = `  <p class="open-now"><span class="open-badge" data-open-badge></span></p>
  <script>const HOURS=${hoursJson};(function(){var b=document.querySelector('[data-open-badge]');if(!b)return;var k=['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];var v=HOURS[k];function set(t,c){b.textContent=t;b.className='open-badge '+c;}if(!v||v.toLowerCase()==='closed'){set('Closed today','closed');return;}var m=v.match(/(\\d{1,2}):(\\d{2})\\s*[–-]\\s*(\\d{1,2}):(\\d{2})/);if(!m){set('','closed');return;}var n=new Date(),t=n.getHours()*60+n.getMinutes(),o=(+m[1])*60+(+m[2]),c=(+m[3])*60+(+m[4]);set(t>=o&&t<c?'Open now':'Closed now',t>=o&&t<c?'open':'closed');})();</script>`

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
    <a href="#gallery">Gallery</a>${intake.extras.enableBooking ? '\n    <a href="#book">Book</a>' : ''}
    <a href="#visit">Visit</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
<section class="hero${heroPhoto ? ' hero--photo' : ''}" aria-label="Welcome"${heroPhoto ? ` style="background-image: linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url('images/${e(heroPhoto)}')"` : ''}>
  <p class="eyebrow">${e(business.type.replace(/_/g, ' '))}${intake.landmark ? ` · ${e(intake.landmark)}` : ''}</p>
  <h1>${name}</h1>
  <p class="tagline">${extraLines.length > 0 ? e(extraLines.join(' ')) : `A friendly local ${business.type.replace(/_/g, ' ')}.`}</p>
  <a class="btn btn--primary" href="#contact">Get in touch</a>
</section>
<main id="main">
  <section id="features" aria-labelledby="features-heading">
    <h2 id="features-heading">Why choose us</h2>
    <div class="feature-grid">
${featureCards}
    </div>
  </section>
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
${reviewBlocks}
  <section id="about" aria-labelledby="about-heading">
    <h2 id="about-heading">About</h2>
    <p>${aboutText}</p>
  </section>
${intake.extras.enableBooking ? renderBookingForm({ slug, publicAppHost, services: intake.services }) + '\n' : ''}  <section id="visit" aria-labelledby="visit-heading">
    <h2 id="visit-heading">Opening hours &amp; location</h2>
${openNowScript}
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
</main>
<footer>
  <p>© ${name} · Website by <a href="https://pykk.uk">PYKK</a></p>
</footer>
${intake.phone ? `<a class="sticky-call" href="${telHref(intake.phone)}">Call ${name}</a>\n` : ''}<script src="https://${publicAppHost}/pv.js" data-site="${slug}" defer></script>
</body>
</html>
`

  const css = `:root {
  --bg: ${palette.bg}; --text: ${palette.text}; --muted: ${palette.muted};
  --accent: ${palette.accent}; --accent-text: ${palette.accentText};
  --surface: ${palette.surface}; --line: ${palette.line};
  --heading-font: ${palette.headingFont}; --heading-transform: ${palette.headingTransform};
}
* { box-sizing: border-box; margin: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.6;
}
.skip-link { position: absolute; left: -999px; }
.skip-link:focus { left: 1rem; top: 1rem; background: var(--accent); color: var(--accent-text); padding: .5rem 1rem; z-index: 10; }
h1, h2 { font-family: var(--heading-font); text-transform: var(--heading-transform); }
.site-header {
  display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 2px solid var(--line); background: var(--bg);
}
.site-header--overlay { position: absolute; inset: 0 0 auto 0; border: none; background: transparent; }
.brand { font-weight: 800; letter-spacing: .04em; }
.site-header nav { display: flex; gap: 1rem; }
.site-header a { color: inherit; text-decoration: none; padding: .5rem 0; opacity: .85; }
a:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.hero { padding: 3.5rem 1.25rem 2.5rem; text-align: center; border-bottom: 1px solid var(--line); }
.hero--photo {
  background-size: cover; background-position: center; color: #fff;
  border-bottom: none; padding: 5rem 1.25rem 4rem;
}
.hero--photo .tagline { color: #f0f0f0; }
.hero h1 { font-size: clamp(2rem, 7vw, 3.2rem); line-height: 1.1; }
.eyebrow {
  color: var(--accent); font-size: .78rem; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; margin-bottom: .6rem;
}
.hero--photo .eyebrow { color: #fff; opacity: .9; }
.tagline { color: var(--muted); margin: .75rem auto 1.5rem; max-width: 34rem; }
.btn {
  display: inline-block; padding: .8rem 1.4rem; border-radius: .5rem; font-weight: 700;
  background: transparent; color: inherit; border: 2px solid var(--accent); text-decoration: none;
}
.btn--primary { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }
main { max-width: 44rem; margin: 0 auto; padding: 0 1.25rem 3rem; }
section { padding: 2.25rem 0 0; }
h2 { font-size: 1.35rem; margin-bottom: 1rem; border-bottom: 2px solid var(--line); padding-bottom: .4rem; }
.price-list { list-style: none; padding: 0; }
.price-row { display: flex; align-items: baseline; gap: .75rem; padding: .55rem 0; border-bottom: 1px dashed var(--line); }
.price-row .leader { flex: 1; border-bottom: 2px dotted var(--muted); transform: translateY(-4px); opacity: .5; }
.price-row .price { font-weight: 700; white-space: nowrap; }
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: .75rem; }
.gallery-grid figure, .photo-placeholder {
  aspect-ratio: 4/3; background: var(--surface); border: 1px solid var(--line); border-radius: .5rem; overflow: hidden;
  display: grid; place-items: center; color: var(--muted); font-size: .85rem; text-align: center; padding: .5rem;
}
.gallery-grid img { width: 100%; height: 100%; object-fit: cover; display: block; }
.reviews { display: grid; gap: 1rem; }
.reviews blockquote { background: var(--surface); border-left: 4px solid var(--accent); border-radius: .5rem; padding: 1rem 1.25rem; }
.reviews blockquote p { font-style: italic; }
.reviews footer { margin-top: .5rem; color: var(--muted); font-size: .9rem; }
.hours { width: 100%; max-width: 22rem; border-collapse: collapse; }
.hours th, .hours td { text-align: left; padding: .4rem 0; border-bottom: 1px solid var(--line); }
.hours td { text-align: right; color: var(--muted); }
.open-now { margin-bottom: .75rem; }
.open-badge {
  display: inline-block; padding: .25rem .8rem; border-radius: 999px; font-size: .82rem; font-weight: 700;
  background: #dcfce7; color: #166534; border: 1px solid #86efac;
}
.open-badge.closed { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .75rem; }
.feature-card {
  background: var(--surface); border: 1px solid var(--line); border-radius: .6rem; padding: 1rem;
  display: flex; flex-direction: column; gap: .45rem;
}
.feature-card .icon { width: 26px; height: 26px; color: var(--accent); }
.feature-card h3 { font-size: .95rem; }
.feature-card p { color: var(--muted); font-size: .85rem; }
.address { margin-top: 1rem; color: var(--muted); }
.directions { display: inline-block; margin-top: .5rem; color: var(--accent); padding: .5rem 0; }
.contact-actions { display: flex; flex-direction: column; gap: .75rem; }
.contact-actions .btn { text-align: center; padding: .9rem; }
footer { text-align: center; color: var(--muted); font-size: .85rem; padding: 2rem 1rem; border-top: 1px solid var(--line); }
footer a { color: var(--accent); }
.map {
  display: block; width: 100%; height: 300px; border: 1px solid var(--line);
  border-radius: .5rem; margin-top: 1rem;
}
.sticky-call {
  display: none; position: fixed; left: 1rem; right: 1rem; bottom: .75rem; z-index: 20;
  background: var(--accent); color: var(--accent-text); text-align: center; font-weight: 700;
  padding: .9rem; border-radius: .6rem; text-decoration: none; box-shadow: 0 4px 18px rgba(0,0,0,.35);
}
@media (max-width: 640px) {
  .sticky-call { display: block; }
  body { padding-bottom: 3.5rem; }
}
.gallery-grid figure img { transition: transform .25s ease; }
.gallery-grid figure:hover img { transform: scale(1.04); }
.btn { transition: background-color .2s ease, color .2s ease, border-color .2s ease; }
@media (min-width: 40rem) { .contact-actions { flex-direction: row; flex-wrap: wrap; } }
${intake.extras.enableBooking ? BOOKING_CSS : ''}
`

  return { html, css }
}
