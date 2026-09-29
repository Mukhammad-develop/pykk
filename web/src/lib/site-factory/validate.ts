// Server-side validation of a generated site before it is accepted.
// Only creative-quality rules — mechanics (beacon, head boilerplate, footer)
// are injected in code afterwards and are NOT checked here (Opus: move every
// rule the model doesn't need to know about into code).

export interface SiteCheckContext {
  slug: string
  publicAppHost: string
}

// mode 'model' = validating the model's raw output (markers required, mechanics
// forbidden); mode 'shipped' = validating final output after injection
// (mechanics required present).
export function validateSite(
  html: string,
  css: string,
  ctx: SiteCheckContext,
  opts: { shipped?: boolean } = {},
): string[] {
  const failures: string[] = []
  const lower = html.toLowerCase()

  if (!html.includes('<html') || !html.includes('</html>')) failures.push('not a complete HTML document')
  if (!html.trimEnd().toLowerCase().endsWith('</html>')) {
    failures.push('index.html looks truncated (does not end with </html>)')
  }
  if ((html.match(/<h1[\s>]/gi) ?? []).length !== 1) failures.push('must contain exactly one <h1>')
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
  if (html.includes('lorem ipsum') || lower.includes('lorem ipsum')) failures.push('contains lorem ipsum')
  if (!html.includes('lang="en-GB"')) failures.push('missing lang="en-GB"')

  if (opts.shipped) {
    // Final output must carry the injected mechanics exactly once.
    if (!html.includes('<meta name="robots" content="noindex">')) failures.push('missing the noindex meta tag (preview mode)')
    if (!html.includes('href="https://pykk.uk"')) failures.push('missing the "Website by PYKK" footer link')
    if (!html.includes(`${ctx.publicAppHost}/pv.js`) || !html.includes(`data-site="${ctx.slug}"`)) {
      failures.push('missing the page-view beacon')
    }
  } else {
    // The model must place component markers instead of hand-building them.
    if (html.includes('id="booking-form"')) failures.push('do not build the booking form — place the <!--BOOKING--> marker instead')
    if (html.includes('google.com/maps')) failures.push('do not build the map embed — place the <!--MAP--> marker instead')
    if (html.includes('/pv.js')) failures.push('do not add the beacon — it is injected in code')
    if (html.includes('name="robots" content="noindex"')) failures.push('do not add the noindex tag — it is injected in code')
    if (html.includes('href="https://pykk.uk"')) failures.push('do not add the footer credit — it is injected in code')
  }

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
