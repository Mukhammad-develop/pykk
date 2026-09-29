import { describe, expect, it } from 'vitest'
import { buildPrompt, extractFiles } from './prompt'
import { EMPTY_INTAKE } from './intake'
import type { businesses } from '@/db/schema'

type Business = typeof businesses.$inferSelect
const business = { id: 1, name: 'Fade & Co.', slug: 'fadeandco', type: 'barber_hair' } as Business

describe('buildPrompt', () => {
  it('embeds the lean rules: markers, no beacon/beacon credit, forbids "subscription"', () => {
    const [system, user] = buildPrompt(business, { ...EMPTY_INTAKE, phone: '07123456789' }, 'admin.pykk.uk')
    expect(system.content).toContain('<!--BOOKING-->')
    expect(system.content).toContain('<!--MAP-->')
    expect(system.content).toContain('lead designer')
    expect(system.content).toContain('never look like templates')
    expect(system.content.toLowerCase()).toContain('never write the word "subscription"')
    expect(system.content).toContain('Do NOT add any analytics scripts, beacons')
    expect(user.content).toContain('07123456789')
    expect(user.content).toContain('barbershop')
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
      ['missing marker'],
    )
    expect(user.content).toContain('"Great cut." — Sam')
    expect(user.content).toContain('missing marker')
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
