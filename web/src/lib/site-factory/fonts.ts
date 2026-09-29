import fs from 'node:fs'
import path from 'node:path'
import type { MoodId } from './intake'

// Self-hosted font pairings (OFL-licensed, latin subsets in web/font-assets/).
// Each client site gets the files copied into sites/{slug}/fonts/ — fully
// static, no external requests, and the single biggest visual upgrade (Opus).

interface FontFile {
  file: string
  family: string
  weight: number
}

export interface FontPairing {
  display: string
  body: string
  files: FontFile[]
}

const INTER: FontFile[] = [
  { file: 'inter-400.woff2', family: 'Inter', weight: 400 },
  { file: 'inter-700.woff2', family: 'Inter', weight: 700 },
]

export const FONT_PAIRINGS: Record<MoodId, FontPairing> = {
  'dark-bold': {
    display: 'Fraunces',
    body: 'Inter',
    files: [{ file: 'fraunces-700.woff2', family: 'Fraunces', weight: 700 }, ...INTER],
  },
  'light-elegant': {
    display: 'Instrument Serif',
    body: 'Inter',
    files: [{ file: 'instrument-serif-400.woff2', family: 'Instrument Serif', weight: 400 }, ...INTER],
  },
  'warm-rustic': {
    display: 'DM Serif Display',
    body: 'Inter',
    files: [{ file: 'dm-serif-display-400.woff2', family: 'DM Serif Display', weight: 400 }, ...INTER],
  },
  'bright-practical': {
    display: 'Space Grotesk',
    body: 'Inter',
    files: [{ file: 'space-grotesk-700.woff2', family: 'Space Grotesk', weight: 700 }, ...INTER],
  },
}

function assetsDir(): string {
  return path.join(process.cwd(), 'font-assets')
}

// The @font-face rules + family overrides, appended to the site's stylesheet.
export function fontFaceCss(pairing: FontPairing): string {
  const faces = pairing.files
    .map(
      (f) => `@font-face {
  font-family: '${f.family}';
  src: url('fonts/${f.file}') format('woff2');
  font-weight: ${f.weight};
  font-style: normal;
  font-display: swap;
}`,
    )
    .join('\n')
  return `
/* self-hosted fonts (subset, latin) */
${faces}
body { font-family: '${pairing.body}', ui-sans-serif, system-ui, sans-serif; }
h1, h2, h3, .brand, .display { font-family: '${pairing.display}', Georgia, serif; }
`
}

// Copies the pairing's font files into the site folder. Returns the filenames.
export function copyFonts(pairing: FontPairing, sitePath: string): string[] {
  const fontsDir = path.join(sitePath, 'fonts')
  fs.mkdirSync(fontsDir, { recursive: true })
  const copied: string[] = []
  for (const f of pairing.files) {
    const src = path.join(assetsDir(), f.file)
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(fontsDir, f.file))
      copied.push(f.file)
    }
  }
  return copied
}
