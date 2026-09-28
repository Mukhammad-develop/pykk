import { describe, expect, it } from 'vitest'
import { escapeHtml, renderBaselineSite } from './baseline'
import { validateSite } from './validate'
import { EMPTY_INTAKE } from './intake'
import type { businesses } from '@/db/schema'

type Business = typeof businesses.$inferSelect

const business = {
  id: 1,
  name: 'Fade & Co. <script>',
  slug: 'fadeandco',
  type: 'barber_hair',
} as Business

const intake = {
  ...EMPTY_INTAKE,
  ownerName: 'Jane',
  phone: '07123 456789',
  whatsapp: '447123456789',
  email: 'jane@example.com',
  address: '12 High Street, Watford',
  hours: { mon: '09:00–18:00', tue: '09:00–18:00', sat: '10:00–16:00', sun: 'closed' },
  services: [
    { name: 'Skin fade', price: '15.00' },
    { name: 'Beard trim', price: '8.00' },
  ],
  mood: 'dark-bold' as const,
  reviews: [{ author: 'Sam, Watford', text: 'Best fade in town, every time.' }],
  socials: { instagram: 'https://instagram.com/fadeandco', facebook: '' },
  heroPhoto: true,
  extras: { barberMode: 'walk-ins' as const },
  additionalInfo: '',
  photos: ['img-01.webp', 'img-02.webp'],
}

describe('renderBaselineSite', () => {
  const { html, css } = renderBaselineSite(business, intake, 'admin.pykk.uk')

  it('produces a site that passes the validator', () => {
    expect(validateSite(html, css, { slug: 'fadeandco', publicAppHost: 'admin.pykk.uk' })).toEqual([])
  })
  it('escapes HTML in user data', () => {
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
  it('includes intake facts: prices, hours, contact links, photos', () => {
    expect(html).toContain('Skin fade')
    expect(html).toContain('£15.00')
    expect(html).toContain('09:00–18:00')
    expect(html).toContain('Closed')
    expect(html).toContain('tel:07123456789')
    expect(html).toContain('https://wa.me/447123456789')
    expect(html).toContain('images/img-01.webp')
    expect(html).toContain('Walk-ins welcome.')
  })
  it('uses the chosen mood palette', () => {
    expect(css).toContain('#14110d') // dark-bold
    expect(css).toContain('#d9a441')
  })
  it('renders real reviews verbatim and socials', () => {
    expect(html).toContain('What customers say')
    expect(html).toContain('Best fade in town, every time.')
    expect(html).toContain('Sam, Watford')
    expect(html).toContain('https://instagram.com/fadeandco')
  })
  it('uses the first photo as hero backdrop when enabled', () => {
    expect(html).toContain('hero--photo')
    expect(html).toContain("url('images/img-01.webp')")
  })
  it('has the beacon, noindex and footer link — and NO bond content', () => {
    expect(html).toContain('src="https://admin.pykk.uk/pv.js" data-site="fadeandco"')
    expect(html).toContain('<meta name="robots" content="noindex">')
    expect(html).toContain('href="https://pykk.uk"')
    expect(html.toLowerCase()).not.toContain('bond')
  })
  it('never says "subscription"', () => {
    expect(html.toLowerCase()).not.toContain('subscription')
  })
  it('skips the reviews section when there are no reviews', () => {
    const { html: noReviews } = renderBaselineSite(business, { ...intake, reviews: [] }, 'admin.pykk.uk')
    expect(noReviews).not.toContain('What customers say')
  })
})

describe('escapeHtml', () => {
  it('escapes the dangerous characters', () => {
    expect(escapeHtml(`<a href="x">&'"</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;&quot;&lt;/a&gt;')
  })
})
