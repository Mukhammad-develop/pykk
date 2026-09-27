import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { isSiteSuspended, restoreSite, suspendSite, PAUSED_MARKER } from './site-control'

describe('site-control (turn a site off and back on)', () => {
  let dir: string
  const slug = 'testsite'
  let indexPath: string

  beforeAll(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pykk-sites-'))
    fs.mkdirSync(path.join(dir, slug), { recursive: true })
    indexPath = path.join(dir, slug, 'index.html')
    fs.writeFileSync(indexPath, '<html><body>real site</body></html>')
  })

  afterAll(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  it('suspends: backs up the real page and writes the turned-off page', () => {
    expect(suspendSite(slug, dir)).toBe('suspended')
    expect(fs.existsSync(indexPath + '.pykk-paused')).toBe(true)
    expect(fs.readFileSync(indexPath, 'utf8')).toContain(PAUSED_MARKER)
    expect(fs.readFileSync(indexPath, 'utf8')).toContain('temporarily turned off')
    expect(isSiteSuspended(slug, dir)).toBe(true)
  })

  it('is idempotent (a second run changes nothing and does not re-backup)', () => {
    const backup = fs.readFileSync(indexPath + '.pykk-paused', 'utf8')
    expect(suspendSite(slug, dir)).toBe('already')
    expect(fs.readFileSync(indexPath + '.pykk-paused', 'utf8')).toBe(backup)
  })

  it('self-heals if the original file reappears (e.g. after a git pull)', () => {
    fs.writeFileSync(indexPath, '<html><body>real site</body></html>') // simulate a git checkout
    expect(isSiteSuspended(slug, dir)).toBe(false)
    expect(suspendSite(slug, dir)).toBe('suspended') // rewrites turned-off page, keeps backup
    expect(fs.readFileSync(indexPath + '.pykk-paused', 'utf8')).toContain('real site')
  })

  it('restores the original page', () => {
    expect(restoreSite(slug, dir)).toBe('restored')
    expect(fs.readFileSync(indexPath, 'utf8')).toBe('<html><body>real site</body></html>')
    expect(fs.existsSync(indexPath + '.pykk-paused')).toBe(false)
    expect(isSiteSuspended(slug, dir)).toBe(false)
  })

  it('handles unknown sites gracefully', () => {
    expect(suspendSite('nope', dir)).toBe('no-site')
    expect(restoreSite('nope', dir)).toBe('no-site')
    expect(restoreSite(slug, dir)).toBe('not-suspended')
  })
})
