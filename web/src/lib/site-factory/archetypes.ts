// The archetype library (Opus stage 4): hand-tuned design foundations.
// Art direction CHOOSES and adapts one instead of inventing from zero — a
// reliability floor with distinctiveness on good days.

export interface Archetype {
  id: string
  moodId: 'dark-bold' | 'light-elegant' | 'warm-rustic' | 'bright-practical'
  label: string
  conceptHint: string
  baseCss: string
}

const shared = `
img { max-width: 100%; height: auto; display: block; }
.container { width: min(1120px, 100% - 2.5rem); margin-inline: auto; }
section { padding-block: clamp(3rem, 8vw, 5.5rem); }
h1, h2, h3 { line-height: 1.05; text-wrap: balance; }
p { max-width: 62ch; }
a { color: inherit; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; border-radius: 2px; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
`

const heritageBarberCss = `:root {
  --bg: #14110d; --surface: #1c1913; --text: #ede6da; --muted: #b3a88f;
  --accent: #d9a441; --accent-ink: #14110d; --line: #3a3324;
  --display: clamp(2.75rem, 8.5vw, 5.5rem);
  --step--1: clamp(.8rem, .77rem + .15vw, .9rem);
  --step-0: clamp(1rem, .95rem + .25vw, 1.15rem);
  --step-1: clamp(1.3rem, 1.1rem + 1vw, 1.9rem);
  --step-2: clamp(1.8rem, 1.4rem + 2vw, 2.9rem);
}
body { background: var(--bg); color: var(--text); font-size: var(--step-0); line-height: 1.65; }
h1, h2, h3, .brand { letter-spacing: .04em; text-transform: uppercase; }
h1 { font-size: var(--display); letter-spacing: .02em; }
h2 { font-size: var(--step-2); }
.eyebrow { color: var(--accent); font-size: var(--step--1); letter-spacing: .18em; text-transform: uppercase; }
.btn { display: inline-block; padding: .9em 1.6em; border: 2px solid var(--accent); color: var(--text); text-decoration: none; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.btn--primary { background: var(--accent); color: var(--accent-ink); }
.rule { border: 0; border-top: 1px solid var(--line); margin-block: 2rem; }
.price-table { border-top: 2px solid var(--accent); }
.price-row { display: flex; align-items: baseline; gap: 1rem; padding: .8rem 0; border-bottom: 1px dashed var(--line); }
.price-row .name { font-weight: 600; }
.price-row .leader { flex: 1; border-bottom: 2px dotted #4a5a3c; transform: translateY(-5px); opacity: .6; }
.price-row .price { color: var(--accent); font-weight: 800; white-space: nowrap; }
.card { background: var(--surface); border: 1px solid var(--line); padding: 1.25rem; }
${shared}`

const luxeBeautyCss = `:root {
  --bg: #faf6f1; --surface: #ffffff; --text: #43333a; --muted: #7d6470;
  --accent: #a4576b; --accent-ink: #ffffff; --sage: #7d8b76; --line: #e3d9d2;
  --display: clamp(2.5rem, 7vw, 4.6rem);
  --step--1: clamp(.8rem, .77rem + .15vw, .9rem);
  --step-0: clamp(1rem, .95rem + .25vw, 1.12rem);
  --step-1: clamp(1.25rem, 1.05rem + 1vw, 1.75rem);
  --step-2: clamp(1.7rem, 1.35rem + 1.8vw, 2.6rem);
}
body { background: var(--bg); color: var(--text); font-size: var(--step-0); line-height: 1.7; }
h1 { font-size: var(--display); font-weight: 400; }
h2 { font-size: var(--step-2); font-weight: 400; }
.eyebrow { color: var(--accent); font-size: var(--step--1); letter-spacing: .16em; text-transform: uppercase; }
.btn { display: inline-block; padding: .85em 1.7em; border-radius: 999px; border: 1.5px solid var(--accent); color: var(--accent); text-decoration: none; font-weight: 600; }
.btn--primary { background: var(--accent); color: var(--accent-ink); }
.card { background: var(--surface); border-radius: 18px; padding: 1.5rem; box-shadow: 0 10px 30px -18px rgba(67, 51, 58, .25); }
.price-row { display: flex; justify-content: space-between; gap: 1rem; padding: .7rem 0; border-bottom: 1px solid var(--line); }
.price-row .price { color: var(--accent); font-weight: 600; white-space: nowrap; }
blockquote { font-style: italic; border-left: 3px solid var(--sage); padding-left: 1.2rem; color: var(--muted); }
${shared}`

const cafeMenuCss = `:root {
  --bg: #f8f2e4; --surface: #fffaf0; --text: #3b2a1e; --muted: #7a6450;
  --accent: #33573c; --accent-ink: #f8f2e4; --accent2: #b0502a; --line: #d9cbb4;
  --display: clamp(2.6rem, 7.5vw, 4.8rem);
  --step--1: clamp(.8rem, .77rem + .15vw, .9rem);
  --step-0: clamp(1rem, .95rem + .25vw, 1.15rem);
  --step-1: clamp(1.25rem, 1.05rem + 1vw, 1.8rem);
  --step-2: clamp(1.75rem, 1.35rem + 2vw, 2.7rem);
}
body { background: var(--bg); color: var(--text); font-size: var(--step-0); line-height: 1.66; }
h1 { font-size: var(--display); }
h2 { font-size: var(--step-2); }
.eyebrow { color: var(--accent2); font-size: var(--step--1); letter-spacing: .14em; text-transform: uppercase; font-weight: 700; }
.btn { display: inline-block; padding: .8em 1.5em; border: 3px double var(--accent); color: var(--accent); text-decoration: none; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; background: var(--surface); }
.btn--primary { background: var(--accent); color: var(--accent-ink); }
.rule { border: 0; border-top: 2px dashed var(--line); margin-block: 2.2rem; }
.menu-item { display: flex; align-items: baseline; gap: .8rem; padding: .6rem 0; }
.menu-item .leader { flex: 1; border-bottom: 2px dotted var(--muted); transform: translateY(-4px); opacity: .55; }
.menu-item .price { color: var(--accent2); font-weight: 800; white-space: nowrap; }
.card { background: var(--surface); border: 1px solid var(--line); padding: 1.4rem; }
.stamp { display: inline-block; padding: .35em .9em; border: 3px double var(--accent2); color: var(--accent2); font-weight: 800; letter-spacing: .1em; text-transform: uppercase; transform: rotate(-2deg); }
${shared}`

const cleanServicesCss = `:root {
  --bg: #ffffff; --surface: #f5f8fc; --text: #12283f; --muted: #546b85;
  --accent: #0b5cab; --accent-ink: #ffffff; --highlight: #f2b705; --line: #d7e2ee;
  --display: clamp(2.4rem, 7vw, 4.4rem);
  --step--1: clamp(.8rem, .77rem + .15vw, .9rem);
  --step-0: clamp(1rem, .95rem + .25vw, 1.12rem);
  --step-1: clamp(1.25rem, 1.05rem + 1vw, 1.75rem);
  --step-2: clamp(1.7rem, 1.35rem + 1.8vw, 2.6rem);
}
body { background: var(--bg); color: var(--text); font-size: var(--step-0); line-height: 1.65; }
h1 { font-size: var(--display); font-weight: 700; }
h2 { font-size: var(--step-2); font-weight: 700; }
.eyebrow { color: var(--accent); font-size: var(--step--1); letter-spacing: .14em; text-transform: uppercase; font-weight: 700; }
.btn { display: inline-block; padding: .9em 1.6em; border-radius: 8px; background: var(--accent); color: var(--accent-ink); text-decoration: none; font-weight: 700; }
.btn--ghost { background: transparent; border: 2px solid var(--accent); color: var(--accent); }
.card { background: var(--surface); border-left: 4px solid var(--accent); border-radius: 8px; padding: 1.25rem 1.4rem; }
.price-row { display: flex; justify-content: space-between; gap: 1rem; padding: .75rem 0; border-bottom: 1px solid var(--line); }
.price-row .price { color: var(--accent); font-weight: 700; white-space: nowrap; }
.pill { display: inline-block; padding: .3em .9em; border-radius: 999px; background: var(--surface); border: 1px solid var(--line); font-size: var(--step--1); font-weight: 600; }
${shared}`

export const ARCHETYPES: Archetype[] = [
  {
    id: 'heritage-barber',
    moodId: 'dark-bold',
    label: 'Heritage Barber',
    conceptHint:
      'Near-black editorial: Fraunces display, amber accents, uppercase condensed headings, thin rules, a ruled price table with dotted leaders, sharp corners. Confident, masculine, heritage.',
    baseCss: heritageBarberCss,
  },
  {
    id: 'luxe-beauty',
    moodId: 'light-elegant',
    label: 'Luxe Beauty',
    conceptHint:
      'Light spa elegance: Instrument Serif, cream and dusty rose, airy whitespace, 18px soft cards, pill buttons, italic pull quotes. Calm and premium.',
    baseCss: luxeBeautyCss,
  },
  {
    id: 'cafe-menu',
    moodId: 'warm-rustic',
    label: 'Warm Café Menu',
    conceptHint:
      'Paper-menu warmth: DM Serif, cream paper stock, forest and terracotta, dashed hand-drawn rules, dotted leaders in the menu, stamp-style bordered CTAs. Cosy and appetising.',
    baseCss: cafeMenuCss,
  },
  {
    id: 'clean-services',
    moodId: 'bright-practical',
    label: 'Clean Services',
    conceptHint:
      'Bright trustworthy utility: Space Grotesk, white and strong blue, 4px left-accent cards, solid blue CTAs, pills for quick facts. Crisp and practical.',
    baseCss: cleanServicesCss,
  },
]

export function archetypeById(id: string | undefined, fallbackType: string): Archetype {
  const found = ARCHETYPES.find((a) => a.id === id)
  if (found) return found
  const byType: Record<string, string> = {
    barber_hair: 'heritage-barber',
    beauty_spa: 'luxe-beauty',
    cafe: 'cafe-menu',
    restaurant: 'cafe-menu',
    cleaning: 'clean-services',
    laundry: 'clean-services',
    retail: 'clean-services',
    local_services: 'clean-services',
    other: 'heritage-barber',
  }
  return ARCHETYPES.find((a) => a.id === (byType[fallbackType ?? ''] ?? 'heritage-barber'))!
}
