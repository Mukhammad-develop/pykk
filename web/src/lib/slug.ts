// Slug rules for client sites and business records.
// Keep RESERVED_SLUGS in sync with scripts/new-site.mjs.
export const RESERVED_SLUGS = [
  'www', 'admin', 'app', 'api', 'mail', 'webmail',
  'cpanel', 'ftp', 'pay', 'status', 'pykk', 'internal',
]

export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/

export function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && !RESERVED_SLUGS.includes(slug)
}
