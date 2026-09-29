import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// Stage 3 ("the eyes", Opus): render the generated page in headless Chromium,
// screenshot it, and ask a vision model for a TASTE critique. Gracefully
// skipped when no browser binary is available (e.g. before the one-time
// server setup), so builds never fail because of it.

export interface SiteShots {
  desktop: Buffer
  mobile: Buffer
}

async function tryScreenshots(html: string, css: string): Promise<SiteShots | null> {
  let browser: import('playwright-core').Browser | null = null
  try {
    const { chromium } = await import('playwright-core')
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pykk-eyes-'))
    fs.writeFileSync(path.join(dir, 'index.html'), html)
    fs.writeFileSync(path.join(dir, 'styles.css'), css)
    browser = await chromium.launch({ headless: true })

    const desktopPage = await browser.newPage({ viewport: { width: 1280, height: 900 } })
    await desktopPage.goto('file://' + path.join(dir, 'index.html'), { waitUntil: 'load' })
    await desktopPage.waitForTimeout(400)
    const desktop = await desktopPage.screenshot({ fullPage: true, type: 'png' })

    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await mobilePage.goto('file://' + path.join(dir, 'index.html'), { waitUntil: 'load' })
    await mobilePage.waitForTimeout(400)
    const mobile = await mobilePage.screenshot({ fullPage: true, type: 'png' })

    fs.rmSync(dir, { recursive: true, force: true })
    return { desktop, mobile }
  } catch {
    return null
  } finally {
    if (browser) await browser.close().catch(() => {})
  }
}

const TASTE_PROMPT = `You are a senior designer reviewing this page for a client paying £500. You are looking at full-page screenshots (desktop and mobile).

Name the THREE weakest things visually: dead space, flat hierarchy, repetitive sections, poor photo crops, cramped mobile layout, default-looking components, anything that smells like a free template. Be specific about WHICH section and exactly what to change (spacing, scale, layout, colour, copy). Do not mention rules or compliance. Be concise — a numbered list of 3 fixes, each one line.`

export interface EyesResult {
  critique: string
}

// Returns null when screenshots or the vision call aren't possible.
export async function lookAndCritique(html: string, css: string): Promise<EyesResult | null> {
  const shots = await tryScreenshots(html, css)
  if (!shots) return null
  try {
    const { callOpenRouterVision } = await import('./openrouter')
    const critique = await callOpenRouterVision(TASTE_PROMPT, [
      { mediaType: 'image/png', data: shots.desktop.toString('base64') },
      { mediaType: 'image/png', data: shots.mobile.toString('base64') },
    ])
    if (!critique || critique.length < 40) return null
    return { critique }
  } catch {
    return null
  }
}
