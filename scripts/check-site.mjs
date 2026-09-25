#!/usr/bin/env node
//
// Pre-flight checks for a client site before pushing.
//
//   node scripts/check-site.mjs fadeandco           → full check
//   node scripts/check-site.mjs fadeandco --webp    → also convert heavy images to WebP
//
// Checks: HTML validity, broken links/images/anchors, image weight,
// leftover [[NEEDS INFO]] placeholders and unfilled {{TOKENS}},
// horizontal scrolling at phone widths (360/390/430 px), accessibility (axe).

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve, extname } from 'node:path'
import { createRequire } from 'node:module'

const slug = process.argv[2]
const doWebp = process.argv.includes('--webp')
if (!slug || slug.startsWith('--')) {
  console.error('Usage: node scripts/check-site.mjs <slug> [--webp]')
  process.exit(2)
}
const root = resolve('sites', slug)
const indexPath = join(root, 'index.html')
if (!existsSync(indexPath)) {
  console.error(`❌ No index.html at ${root} — is the slug right?`)
  process.exit(2)
}

const errors = []
const warnings = []
const passes = []
const err = (m) => errors.push(m)
const warn = (m) => warnings.push(m)
const ok = (m) => passes.push(m)

const html = readFileSync(indexPath, 'utf8')
const require = createRequire(import.meta.url)

// --- 1. HTML validity -------------------------------------------------------
try {
  const { HtmlValidate } = await import('html-validate')
  const validator = new HtmlValidate({
    extends: ['html-validate:recommended'],
    rules: {
      // Placeholders like "Call: [[NEEDS INFO: phone]]" are not real phone
      // numbers; non-breaking spaces are handled when real numbers are filled in.
      'tel-non-breaking': 'off',
    },
  })
  const report = await validator.validateFile(indexPath)
  if (report.valid) {
    ok('HTML is valid')
  } else {
    for (const result of report.results) {
      for (const message of result.messages) {
        err(`HTML: ${result.filePath.split('/').pop()}:${message.line} ${message.message}`)
      }
    }
  }
} catch (e) {
  err(`HTML validation could not run: ${e.message}`)
}

// --- 2. Broken links, images and anchors ------------------------------------
const { parse } = await import('node-html-parser')
const doc = parse(html)
const refs = []
for (const el of doc.querySelectorAll('[href], [src]')) {
  const value = (el.getAttribute('href') || el.getAttribute('src') || '').trim()
  if (value) refs.push(value)
}

async function checkExternal(url) {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: controller.signal })
    clearTimeout(timer)
    return res.status < 400
  } catch {
    return false
  }
}

const localChecked = new Set()
for (const ref of refs) {
  if (/^(tel:|mailto:|sms:|data:|javascript:)/i.test(ref)) continue
  if (ref.startsWith('#')) {
    const id = ref.slice(1)
    if (id && !doc.getElementById(id)) err(`Broken anchor link: ${ref} (no element with that id)`)
    continue
  }
  if (/^https?:\/\//i.test(ref)) {
    if (!(await checkExternal(ref))) warn(`External link may be broken (no good response): ${ref}`)
    continue
  }
  if (ref.startsWith('//')) continue
  const filePath = join(root, decodeURIComponent(ref.split(/[?#]/)[0]))
  if (localChecked.has(filePath)) continue
  localChecked.add(filePath)
  if (!existsSync(filePath)) err(`Missing local file: ${ref}`)
}
if (!errors.some((e) => e.startsWith('Missing local file') || e.startsWith('Broken anchor'))) {
  ok(`Links, images and anchors resolve (${refs.length} references checked)`)
}

// --- 3. Image weight ---------------------------------------------------------
function* walkFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) yield* walkFiles(full)
    else yield full
  }
}
const IMAGE_RE = /\.(jpe?g|png|gif|webp|avif)$/i
const heavyImages = []
let imageCount = 0
for (const file of walkFiles(root)) {
  if (IMAGE_RE.test(file)) {
    imageCount++
    const kb = statSync(file).size / 1024
    if (kb > 300) heavyImages.push({ file, kb: Math.round(kb) })
  }
}
for (const { file, kb } of heavyImages) {
  warn(`Heavy image (${kb} KB, over the 300 KB guide): ${file}`)
}
if (heavyImages.length === 0) ok(`Image weight fine (${imageCount} images)`)
else warn('Tip: run with --webp to convert heavy JPG/PNG images to WebP and update index.html')

if (doWebp && heavyImages.length > 0) {
  try {
    const sharp = (await import('sharp')).default
    let indexHtml = html
    for (const { file } of heavyImages) {
      if (!/\.(jpe?g|png)$/i.test(file)) continue
      const out = file.replace(IMAGE_RE, '.webp')
      await sharp(file).webp({ quality: 82 }).toFile(out)
      const before = file.split('/').pop()
      const after = out.split('/').pop()
      indexHtml = indexHtml.split(before).join(after)
      ok(`Converted ${before} → ${after}`)
    }
    if (indexHtml !== html) writeFileSync(indexPath, indexHtml)
  } catch (e) {
    err(`WebP conversion failed: ${e.message}`)
  }
}

// --- 4. Placeholders and unfilled tokens -------------------------------------
const needsInfo = (html.match(/\[\[NEEDS INFO/g) || []).length
const isPreview = /<meta\s+name="robots"\s+content="noindex"\s*>/i.test(html)
const unfilled = html.match(/\{\{[A-Z_]+\}\}/g)
if (unfilled) err(`Unfilled template tokens: ${[...new Set(unfilled)].join(', ')}`)
if (needsInfo === 0) {
  ok('No [[NEEDS INFO]] placeholders left')
} else if (isPreview) {
  warn(`${needsInfo} [[NEEDS INFO: …]] placeholder(s) — fine while in preview, must be 0 before publishing`)
} else {
  err(`${needsInfo} [[NEEDS INFO: …]] placeholder(s) left — fill them before publishing`)
}
if (!isPreview) ok('Published mode (no noindex tag)')

// --- 5+6. Phone layout and accessibility (Playwright + axe) -------------------
let chromium
try {
  ;({ chromium } = await import('playwright'))
} catch {
  err('Playwright is not installed. Run: pnpm install && npx playwright install chromium')
}
let browser
try {
  browser = chromium && (await chromium.launch())
} catch {
  err('Playwright browser missing. Run: npx playwright install chromium')
}

if (browser) {
  try {
    const page = await browser.newPage()
    for (const width of [360, 390, 430]) {
      await page.setViewportSize({ width, height: 844 })
      await page.goto('file://' + indexPath, { waitUntil: 'load' })
      const overflow = await page.evaluate(() => {
        if (document.documentElement.scrollWidth <= window.innerWidth) return null
        const offenders = [...document.querySelectorAll('body *')]
          .filter((el) => {
            const r = el.getBoundingClientRect()
            return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1)
          })
          .slice(0, 5)
          .map((el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).join('.') : ''))
        return { scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth, offenders }
      })
      if (overflow) {
        err(`Horizontal scroll at ${overflow.innerWidth}px (page is ${overflow.scrollWidth}px wide). Widest: ${overflow.offenders.join(', ')}`)
      } else {
        ok(`No horizontal scroll at ${width}px`)
      }
    }

    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('file://' + indexPath, { waitUntil: 'load' })
    const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')
    await page.addScriptTag({ content: axeSource })
    const axeResults = await page.evaluate(async () => {
      const results = await window.axe.run()
      return results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.length,
      }))
    })
    if (axeResults.length === 0) {
      ok('Accessibility (axe): no violations')
    } else {
      for (const v of axeResults) {
        const line = `Accessibility: ${v.id} (${v.impact}, ${v.nodes} element(s)) — ${v.help}`
        if (v.impact === 'critical' || v.impact === 'serious') err(line)
        else warn(line)
      }
    }
    await browser.close()
  } catch (e) {
    err(`Browser checks failed: ${e.message}`)
    try { await browser.close() } catch { /* already closed */ }
  }
}

// --- Summary -----------------------------------------------------------------
console.log(`\nChecking sites/${slug}\n`)
for (const m of passes) console.log(`  ✅ ${m}`)
for (const m of warnings) console.log(`  ⚠️  ${m}`)
for (const m of errors) console.log(`  ❌ ${m}`)
console.log()
if (errors.length > 0) {
  console.log(`❌ ${errors.length} error(s), ${warnings.length} warning(s) — fix the errors before pushing.\n`)
  process.exit(1)
}
console.log(`✅ All good — ${warnings.length} warning(s). Safe to push.\n`)
