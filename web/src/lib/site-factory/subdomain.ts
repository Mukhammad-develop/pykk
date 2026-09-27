import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { isValidSlug } from '@/lib/slug'

const execFileAsync = promisify(execFile)

export interface SubdomainResult {
  created: boolean
  sslStarted: boolean
  message: string
}

// Creates {slug}.pykk.uk (document root pykk/sites/{slug}) and starts AutoSSL —
// the app-side version of what update.sh does. No shell, slug strictly validated.
export async function ensureSubdomain(slug: string, rootDomain = 'pykk.uk'): Promise<SubdomainResult> {
  if (!isValidSlug(slug)) {
    return { created: false, sslStarted: false, message: `Invalid slug "${slug}" — refusing to create a subdomain` }
  }
  const fqdn = `${slug}.${rootDomain}`

  let existing: string
  try {
    const { stdout } = await execFileAsync('uapi', ['SubDomain', 'listsubdomains', '--output=json'], { timeout: 30_000 })
    existing = stdout
  } catch (error) {
    return { created: false, sslStarted: false, message: `uapi not available (${(error as Error).message}) — create the subdomain manually in cPanel` }
  }

  if (existing.includes(fqdn)) {
    return { created: false, sslStarted: true, message: `${fqdn} already exists` }
  }

  try {
    const { stdout } = await execFileAsync(
      'uapi',
      ['SubDomain', 'addsubdomain', `domain=${slug}`, `rootdomain=${rootDomain}`, `dir=pykk/sites/${slug}`, '--output=json'],
      { timeout: 30_000 },
    )
    if (!stdout.includes('"status":1')) {
      return { created: false, sslStarted: false, message: `uapi failed to create ${fqdn}: ${stdout.slice(0, 200)}` }
    }
  } catch (error) {
    return { created: false, sslStarted: false, message: `uapi error creating ${fqdn}: ${(error as Error).message}` }
  }

  let sslStarted = false
  try {
    await execFileAsync('uapi', ['SSL', 'start_autossl_check'], { timeout: 30_000 })
    sslStarted = true
  } catch {
    // SSL can also be triggered from cPanel — not fatal
  }

  return { created: true, sslStarted, message: `Created ${fqdn}${sslStarted ? ' and started AutoSSL' : ''}` }
}
