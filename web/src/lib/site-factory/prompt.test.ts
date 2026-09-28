import { describe, expect, it } from 'vitest'
import { buildPrompt, extractFiles } from './prompt'
import { EMPTY_INTAKE } from './intake'
import type { businesses } from '@/db/schema'

type Business = typeof businesses.$inferSelect
const business = { id: 1, name: 'Fade & Co.', slug: 'fadeandco', type: 'barber_hair' } as Business

describe('buildPrompt', () => {
  it('embeds the rules, the slug, the host and forbids "subscription" and bond content', () => {
    const [system, user] = buildPrompt(business, { ...EMPTY_INTAKE, phone: '07123456789' }, 'admin.pykk.uk')
    expect(system.content).toContain('data-site="fadeandco"')
    expect(system.content).toContain('admin.pykk.uk/pv.js')
    expect(system.content.toLowerCase()).toContain('never the word "subscription"')
    expect(system.content).toContain('NEVER mention PYKK')
    expect(system.content).toContain('Reviews may appear ONLY if explicitly provided')
    expect(user.content).toContain('07123456789')
    expect(user.content).toContain('barber')
  })
  it('uses the chosen mood direction', () => {
    const [, user] = buildPrompt(business, { ...EMPTY_INTAKE, mood: 'light-elegant' }, 'admin.pykk.uk')
    expect(user.content).toContain('Light & elegant')
    expect(user.content).toContain('#faf6f1')
  })
  it('passes real reviews verbatim and feeds previous failures back', () => {
    const [, user] = buildPrompt(
      business,
      { ...EMPTY_INTAKE, reviews: [{ author: 'Sam', text: 'Great cut.' }] },
      'admin.pykk.uk',
      ['missing noindex'],
    )
    expect(user.content).toContain('"Great cut." — Sam')
    expect(user.content).toContain('missing noindex')
    expect(user.content).toContain('REJECTED')
  })
})

describe('extractFiles', () => {
  it('extracts the two files', () => {
    const answer = 'blah\n=== index.html ===\n<html>hi</html>\n=== styles.css ===\nbody{}\n'
    const files = extractFiles(answer)
    expect(files?.html).toBe('<html>hi</html>')
    expect(files?.css).toBe('body{}')
  })
  it('strips stray code fences', () => {
    const answer = '=== index.html ===\n```html\n<html>hi</html>\n```\n=== styles.css ===\n```css\nbody{}\n```'
    const files = extractFiles(answer)
    expect(files?.html).toBe('<html>hi</html>')
    expect(files?.css).toBe('body{}')
  })
  it('returns null when the contract is missing', () => {
    expect(extractFiles('<html>only one file</html>')).toBeNull()
  })
})
