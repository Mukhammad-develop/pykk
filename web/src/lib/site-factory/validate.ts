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
  if (!html.includes('id="features"')) failures.push('missing the #features "Why choose us" icon-cards section')
  if ((html.match(/<svg/g) ?? []).length < 3) failures.push('missing inline SVG icons (need at least 3)')
  if (html.includes('{{')) failures.push('contains unfilled {{TOKEN}} placeholders')
  if (lower.includes('subscription')) failures.push('contains the forbidden word "subscription" — use "bond"')
  // The bond pitch is PYKK-internal: it belongs in the client area, never on
  // the public site (founder decision — a public page sells the business only).
  if (/your bond|monthly bond|bond payment|bond with pykk/i.test(html)) {
    failures.push('contains PYKK-internal bond content — the public site must sell the business only')
  }
  if (!css || css.length < 200) failures.push('styles.css is missing or too small')
  // Truncation check: an LLM that runs out of tokens leaves unbalanced braces
  // and a file that ends mid-rule. Never ship that.
  const openBraces = (css.match(/{/g) ?? []).length
  const closeBraces = (css.match(/}/g) ?? []).length
  if (openBraces !== closeBraces || !css.trimEnd().endsWith('}')) {
    failures.push('styles.css looks truncated (unbalanced braces)')
  }
  if (!html.trimEnd().toLowerCase().endsWith('</html>')) {
    failures.push('index.html looks truncated (does not end with </html>)')
  }
  if (html.includes('lorem ipsum') || lower.includes('lorem ipsum')) failures.push('contains lorem ipsum')
  if (!html.includes('lang="en-GB"')) failures.push('missing lang="en-GB"')

  return failures
}

// The optional script.js must stay tiny, library-free and local.
export function validateScript(js: string, publicAppHost: string): string[] {
  const failures: string[] = []
  if (js.length > 4000) failures.push('script.js is too large (must stay tiny)')
  if (js.includes('eval(')) failures.push('script.js uses eval()')
  const urls = js.match(/https?:\/\/[^\s'"`)]+/g) ?? []
  for (const url of urls) {
    if (!url.includes(publicAppHost) && !url.includes('pykk.uk')) {
      failures.push(`script.js references an external URL: ${url.slice(0, 60)}`)
    }
  }
  return failures
}
