import fs from 'node:fs'
import path from 'node:path'

// Turns a client's static site into a "temporarily turned off" page and back.
// Works on the server, where SITES_DIR points at the sites folder (the app and
// the sites live on the same machine). The original index.html is backed up as
// index.html.pykk-paused and restored on payment.

export const PAUSED_MARKER = '<!-- pykk:paused -->'
const BACKUP_SUFFIX = '.pykk-paused'

export function sitesDir(): string {
  const dir = process.env.SITES_DIR || path.join(process.env.HOME ?? '~', 'pykk', 'sites')
  return dir.replace(/^~(?=\/)/, process.env.HOME ?? '~')
}

function turnedOffHtml(): string {
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
${PAUSED_MARKER}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Temporarily turned off</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
         font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
         background: #0b0f14; color: #e8edf2; text-align: center; padding: 2rem; }
  h1 { font-size: 1.5rem; margin: 0 0 .5rem; }
  p { color: #9fb0c0; margin: 0; }
</style>
</head>
<body>
<main>
  <h1>This website is temporarily turned off</h1>
  <p>Please contact PYKK to bring it back.</p>
</main>
</body>
</html>
`
}

export function siteIndexPath(slug: string, dir: string = sitesDir()): string {
  return path.join(dir, slug, 'index.html')
}

export function isSiteSuspended(slug: string, dir: string = sitesDir()): boolean {
  const indexPath = siteIndexPath(slug, dir)
  if (!fs.existsSync(indexPath)) return false
  return fs.readFileSync(indexPath, 'utf8').includes(PAUSED_MARKER)
}

// Idempotent: safe to run any number of times (e.g. daily job after a git pull
// restored the original file). Returns what it did.
export function suspendSite(
  slug: string,
  dir: string = sitesDir(),
): 'suspended' | 'already' | 'no-site' {
  const indexPath = siteIndexPath(slug, dir)
  if (!fs.existsSync(indexPath)) return 'no-site'
  if (isSiteSuspended(slug, dir)) return 'already'

  const backupPath = indexPath + BACKUP_SUFFIX
  if (!fs.existsSync(backupPath)) {
    fs.renameSync(indexPath, backupPath)
  }
  fs.writeFileSync(indexPath, turnedOffHtml())
  return 'suspended'
}

// Returns what it did. Missing backup just removes the turned-off page.
export function restoreSite(
  slug: string,
  dir: string = sitesDir(),
): 'restored' | 'not-suspended' | 'no-site' {
  const indexPath = siteIndexPath(slug, dir)
  const backupPath = indexPath + BACKUP_SUFFIX
  if (!fs.existsSync(indexPath) && !fs.existsSync(backupPath)) return 'no-site'
  if (!isSiteSuspended(slug, dir)) return 'not-suspended'

  fs.rmSync(indexPath)
  if (fs.existsSync(backupPath)) {
    fs.renameSync(backupPath, indexPath)
  }
  return 'restored'
}
