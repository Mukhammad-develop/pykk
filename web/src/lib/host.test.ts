import { describe, expect, it } from 'vitest'
import {
  allowlistAppliesTo,
  classifyHost,
  fallbackActive,
  ipAllowed,
  isPublicPath,
  pathAllowedOnHost,
} from './host'

const ROOT = 'pykk.uk'

describe('classifyHost', () => {
  it('recognises the admin host', () => {
    expect(classifyHost('admin.pykk.uk', ROOT)).toBe('admin')
    expect(classifyHost('ADMIN.pykk.uk', ROOT)).toBe('admin')
    expect(classifyHost('admin.pykk.uk:443', ROOT)).toBe('admin')
    expect(classifyHost('admin.localhost', ROOT)).toBe('admin')
    expect(classifyHost('admin.localhost:3000', ROOT)).toBe('admin')
  })

  it('recognises the app host', () => {
    expect(classifyHost('app.pykk.uk', ROOT)).toBe('app')
    expect(classifyHost('app.localhost:3000', ROOT)).toBe('app')
  })

  it('treats bare localhost as admin (dev convenience)', () => {
    expect(classifyHost('localhost:3000', ROOT)).toBe('admin')
  })

  it('rejects unknown hosts', () => {
    expect(classifyHost('evil.com', ROOT)).toBe('unknown')
    expect(classifyHost('fadeandco.pykk.uk', ROOT)).toBe('unknown')
    expect(classifyHost(null, ROOT)).toBe('unknown')
  })
})

describe('isPublicPath', () => {
  it('matches pay pages, the beacon API and pv.js', () => {
    expect(isPublicPath('/pay/JK891P')).toBe(true)
    expect(isPublicPath('/pay/JK891P/anything')).toBe(true)
    expect(isPublicPath('/api/pv')).toBe(true)
    expect(isPublicPath('/pv.js')).toBe(true)
  })

  it('does not match admin paths', () => {
    expect(isPublicPath('/')).toBe(false)
    expect(isPublicPath('/login')).toBe(false)
    expect(isPublicPath('/pay')).toBe(false) // no reference — not a pay page
    expect(isPublicPath('/settings')).toBe(false)
  })
})

describe('pathAllowedOnHost (fallback active, like this server)', () => {
  const FALLBACK = true

  it('serves admin paths only on the admin host', () => {
    expect(pathAllowedOnHost('admin', '/', FALLBACK)).toBe(true)
    expect(pathAllowedOnHost('admin', '/login', FALLBACK)).toBe(true)
    expect(pathAllowedOnHost('app', '/', FALLBACK)).toBe(false)
    expect(pathAllowedOnHost('app', '/login', FALLBACK)).toBe(false)
  })

  it('serves public paths on the app host always', () => {
    expect(pathAllowedOnHost('app', '/pay/JK891P', FALLBACK)).toBe(true)
    expect(pathAllowedOnHost('app', '/api/pv', FALLBACK)).toBe(true)
  })

  it('serves public paths on the admin host only in fallback mode', () => {
    expect(pathAllowedOnHost('admin', '/pay/JK891P', true)).toBe(true)
    expect(pathAllowedOnHost('admin', '/pay/JK891P', false)).toBe(false)
    expect(pathAllowedOnHost('admin', '/api/pv', false)).toBe(false)
  })

  it('serves /healthz on every known host', () => {
    expect(pathAllowedOnHost('admin', '/healthz', FALLBACK)).toBe(true)
    expect(pathAllowedOnHost('app', '/healthz', FALLBACK)).toBe(true)
    expect(pathAllowedOnHost('app', '/healthz', false)).toBe(true)
  })

  it('rejects unknown hosts entirely', () => {
    expect(pathAllowedOnHost('unknown', '/', FALLBACK)).toBe(false)
    expect(pathAllowedOnHost('unknown', '/healthz', FALLBACK)).toBe(false)
  })
})

describe('fallbackActive', () => {
  it('is active when the public host IS the admin host', () => {
    expect(fallbackActive('admin.pykk.uk', ROOT)).toBe(true)
    expect(fallbackActive('app.pykk.uk', ROOT)).toBe(false)
  })
})

describe('allowlistAppliesTo', () => {
  it('never applies to public paths or healthz', () => {
    expect(allowlistAppliesTo('/pay/JK891P')).toBe(false)
    expect(allowlistAppliesTo('/api/pv')).toBe(false)
    expect(allowlistAppliesTo('/pv.js')).toBe(false)
    expect(allowlistAppliesTo('/healthz')).toBe(false)
  })
  it('applies to admin paths', () => {
    expect(allowlistAppliesTo('/')).toBe(true)
    expect(allowlistAppliesTo('/settings')).toBe(true)
  })
})

describe('ipAllowed', () => {
  it('allows everything when the list is empty', () => {
    expect(ipAllowed(null, '')).toBe(true)
    expect(ipAllowed('1.2.3.4', '  ')).toBe(true)
  })
  it('matches exact IPs from a comma-separated list', () => {
    expect(ipAllowed('1.2.3.4', '1.2.3.4, 5.6.7.8')).toBe(true)
    expect(ipAllowed('9.9.9.9', '1.2.3.4, 5.6.7.8')).toBe(false)
    expect(ipAllowed(null, '1.2.3.4')).toBe(false)
  })
})
