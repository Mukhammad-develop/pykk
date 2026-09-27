// Server-side validation of a generated site before it is accepted.
// Every failure is human-readable so it can be fed back to the model on retry.

export interface SiteCheckContext {
  slug: string
  publicAppHost: string
}

export function validateSite(html: string, css: string, ctx: SiteCheckContext): string[] {
  const failures: string[] = []
  const lower = html.toLowerCase()

  if (!html.includes('<html') || !html.includes('</html>')) failures.push('not a complete HTML document')
  if ((html.match(/<h1[\s>]/gi) ?? []).length !== 1) failures.push('must contain exactly one <h1>')
  if (!html.includes('<meta name="robots" content="noindex">')) failures.push('missing the noindex meta tag (preview mode)')
  if (!html.includes(`data-site="${ctx.slug}"`)) failures.push(`beacon is missing data-site="${ctx.slug}"`)
  if (!html.includes(`${ctx.publicAppHost}/pv.js`)) failures.push(`beacon src must be https://${ctx.publicAppHost}/pv.js`)
  if (!html.includes('href="https://pykk.uk"')) failures.push('missing the "Website by PYKK" footer link to https://pykk.uk')
  if (html.includes('{{')) failures.push('contains unfilled {{TOKEN}} placeholders')
  if (lower.includes('subscription')) failures.push('contains the forbidden word "subscription" — use "bond"')
  if (!/your bond/i.test(html)) failures.push('missing the "Your bond" section (see CLIENT_SITE_GUIDE §5)')
  if (!css || css.length < 200) failures.push('styles.css is missing or too small')
  if (html.includes('lorem ipsum') || lower.includes('lorem ipsum')) failures.push('contains lorem ipsum')
  if (!html.includes('lang="en-GB"')) failures.push('missing lang="en-GB"')

  return failures
}
