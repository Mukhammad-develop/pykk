import { describe, expect, it } from 'vitest'
import { validateSite } from './validate'

const ctx = { slug: 'fadeandco', publicAppHost: 'admin.pykk.uk' }

const goodHtml = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Fade &amp; Co.</title>
<meta name="description" content="x">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<main><h1>Fade &amp; Co.</h1>
<section id="bond"><h2>Your bond with PYKK</h2><p>bond text</p></section>
</main>
<footer>© Fade &amp; Co. · Website by <a href="https://pykk.uk">PYKK</a></footer>
<script src="https://admin.pykk.uk/pv.js" data-site="fadeandco" defer></script>
</body>
</html>`
const goodCss = 'body { color: #111; background: #fff; font-family: sans-serif; }' + '/* x */'.repeat(40)

describe('validateSite', () => {
  it('accepts a compliant site', () => {
    expect(validateSite(goodHtml, goodCss, ctx)).toEqual([])
  })
  it('rejects a missing/wrong beacon slug', () => {
    const html = goodHtml.replace('data-site="fadeandco"', 'data-site="wrong"')
    expect(validateSite(html, goodCss, ctx).join(' ')).toContain('data-site="fadeandco"')
  })
  it('rejects the forbidden word "subscription"', () => {
    const html = goodHtml.replace('bond text', 'subscription text')
    expect(validateSite(html, goodCss, ctx).join(' ')).toContain('subscription')
  })
  it('rejects missing noindex, footer link, bond section and tokens', () => {
    expect(validateSite(goodHtml.replace('<meta name="robots" content="noindex">', ''), goodCss, ctx).join(' ')).toContain('noindex')
    expect(validateSite(goodHtml.replace('href="https://pykk.uk"', 'href="https://example.com"'), goodCss, ctx).join(' ')).toContain('PYKK')
    expect(validateSite(goodHtml.replace('Your bond with PYKK', 'About us'), goodCss, ctx).join(' ')).toContain('bond')
    expect(validateSite(goodHtml + '{{SITE_NAME}}', goodCss, ctx).join(' ')).toContain('{{TOKEN}}')
  })
  it('rejects missing h1, multiple h1s, and thin css', () => {
    expect(validateSite(goodHtml.replace('<h1>', '<h2>').replace('</h1>', '</h2>'), goodCss, ctx).join(' ')).toContain('<h1>')
    expect(validateSite(goodHtml.replace('</main>', '<h1>Two</h1></main>'), goodCss, ctx).join(' ')).toContain('exactly one')
    expect(validateSite(goodHtml, 'body{}', ctx).join(' ')).toContain('styles.css')
  })
})
