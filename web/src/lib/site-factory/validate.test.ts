import { describe, expect, it } from 'vitest'
import { validateSite, validateScript } from './validate'

const ctx = { slug: 'fadeandco', publicAppHost: 'admin.pykk.uk' }

const goodHtml = `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Fade &amp; Co.</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<main><h1>Fade &amp; Co.</h1>
<section><h2>Prices</h2><p>honest text</p></section>
</main>
</body>
</html>`
const goodCss = 'body { color: #111; background: #fff; font-family: sans-serif; }' + '/* x */'.repeat(40) + '\nfooter { padding: 1rem; }\n'

describe('validateSite (slim, post-Opus rules)', () => {
  it('accepts compliant model output (mechanics come later, not required)', () => {
    expect(validateSite(goodHtml, goodCss, ctx)).toEqual([])
  })
  it('accepts shipped output with mechanics present', () => {
    const shipped = goodHtml
      .replace('<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="robots" content="noindex">')
      .replace('</body>', '<footer><a href="https://pykk.uk">PYKK</a></footer>\n<script src="https://admin.pykk.uk/pv.js" data-site="fadeandco" defer></script>\n</body>')
    expect(validateSite(shipped, goodCss, ctx, { shipped: true })).toEqual([])
  })
  it('rejects shipped output missing the mechanics', () => {
    expect(validateSite(goodHtml, goodCss, ctx, { shipped: true }).join(' ')).toContain('noindex')
    expect(validateSite(goodHtml, goodCss, ctx, { shipped: true }).join(' ')).toContain('PYKK')
    expect(validateSite(goodHtml, goodCss, ctx, { shipped: true }).join(' ')).toContain('beacon')
  })
  it('rejects truncation of html or css', () => {
    expect(validateSite(goodHtml.replace('</body>\n</html>', '<div class="unfinish'), goodCss, ctx).join(' ')).toContain('truncated')
    expect(validateSite(goodHtml, goodCss + '\n.hero {\n  background: ', ctx).join(' ')).toContain('truncated')
  })
  it('rejects the forbidden word "subscription" and bond content', () => {
    expect(validateSite(goodHtml.replace('honest text', 'subscription text'), goodCss, ctx).join(' ')).toContain('subscription')
    expect(validateSite(goodHtml.replace('honest text', 'your bond with PYKK'), goodCss, ctx).join(' ')).toContain('bond')
  })
  it('rejects missing h1 and multiple h1s', () => {
    expect(validateSite(goodHtml.replace('<h1>', '<h2>').replace('</h1>', '</h2>'), goodCss, ctx).join(' ')).toContain('<h1>')
    expect(validateSite(goodHtml.replace('</main>', '<h1>Two</h1></main>'), goodCss, ctx).join(' ')).toContain('exactly one')
  })
  it('rejects hand-built mechanics — the model must use markers', () => {
    expect(validateSite(goodHtml.replace('</main>', '<form id="booking-form"></form></main>'), goodCss, ctx).join(' ')).toContain('<!--BOOKING-->')
    expect(validateSite(goodHtml.replace('</main>', '<iframe src="https://www.google.com/maps?q=x&output=embed"></iframe></main>'), goodCss, ctx).join(' ')).toContain('<!--MAP-->')
    expect(validateSite(goodHtml.replace('</main>', '<script src="https://admin.pykk.uk/pv.js"></script></main>'), goodCss, ctx).join(' ')).toContain('beacon')
  })
  it('rejects thin css and lorem ipsum', () => {
    expect(validateSite(goodHtml, 'body{}', ctx).join(' ')).toContain('styles.css')
    expect(validateSite(goodHtml.replace('honest text', 'lorem ipsum dolor'), goodCss, ctx).join(' ')).toContain('lorem ipsum')
  })
})

describe('validateScript', () => {
  it('accepts a tiny local script', () => {
    expect(validateScript('document.addEventListener("click",()=>{})', 'admin.pykk.uk')).toEqual([])
  })
  it('rejects big, eval-y and externally-referencing scripts', () => {
    expect(validateScript('x'.repeat(5000), 'admin.pykk.uk').join(' ')).toContain('too large')
    expect(validateScript('eval("1")', 'admin.pykk.uk').join(' ')).toContain('eval')
    expect(validateScript('fetch("https://evil.com/x")', 'admin.pykk.uk').join(' ')).toContain('external')
  })
})
