#!/usr/bin/env node
//
// Create a new client site from a template, or publish an existing one.
//
//   node scripts/new-site.mjs --slug fadeandco --name "Fade & Co." --type barber
//   node scripts/new-site.mjs --slug fadeandco --publish
//
// Types: barber | beauty | cafe | services  (folders in sites/_templates/)
// The beacon host comes from PUBLIC_APP_HOST (default: admin.pykk.uk).

import { cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const TEMPLATES_DIR = join('sites', '_templates')
const SITES_DIR = 'sites'
const PUBLIC_APP_HOST = process.env.PUBLIC_APP_HOST || 'admin.pykk.uk'
const RESERVED = ['www', 'admin', 'app', 'api', 'mail', 'webmail', 'cpanel', 'ftp', 'pay', 'status', 'pykk']
const NOINDEX = '<meta name="robots" content="noindex">'

function fail(message) {
  console.error(`\n❌ ${message}\n`)
  process.exit(1)
}

function parseArgs(argv) {
  const args = { publish: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--publish') args.publish = true
    else if (a === '--slug') args.slug = argv[++i]
    else if (a === '--name') args.name = argv[++i]
    else if (a === '--type') args.type = argv[++i]
    else fail(`Unknown argument: ${a}`)
  }
  return args
}

function validateSlug(slug) {
  if (!slug) fail('Missing --slug. Example: --slug fadeandco')
  if (!/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/.test(slug)) {
    fail(`Bad slug "${slug}". Use 3–40 characters: lowercase a–z, 0–9 and hyphens, not starting or ending with a hyphen.`)
  }
  if (RESERVED.includes(slug)) fail(`"${slug}" is a reserved name and can't be used for a client site.`)
}

function fillTokens(filePath, values) {
  let text = readFileSync(filePath, 'utf8')
  for (const [token, value] of Object.entries(values)) {
    text = text.split(`{{${token}}}`).join(value)
  }
  writeFileSync(filePath, text)
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) yield* walk(full)
    else yield full
  }
}

const args = parseArgs(process.argv.slice(2))
validateSlug(args.slug)
const siteDir = join(SITES_DIR, args.slug)

if (args.publish) {
  if (!existsSync(siteDir)) fail(`No site at ${siteDir} — nothing to publish.`)
  const indexFile = join(siteDir, 'index.html')
  const html = readFileSync(indexFile, 'utf8')
  if (!html.includes(NOINDEX)) {
    console.log(`\n✅ ${args.slug} is already published (no noindex tag found).\n`)
    process.exit(0)
  }
  writeFileSync(indexFile, html.replace(`    ${NOINDEX}\n`, '').replace(`${NOINDEX}\n`, '').replace(NOINDEX, ''))
  console.log(`\n✅ ${args.slug} is now published (noindex removed).`)
  console.log('Next: git add sites/' + args.slug + ' && git commit -m "Publish site: ' + args.slug + '" && git push')
  console.log('Then on cPanel: bash ~/pykk/scripts/update.sh\n')
  process.exit(0)
}

if (existsSync(siteDir)) fail(`${siteDir} already exists. To publish it, use: node scripts/new-site.mjs --slug ${args.slug} --publish`)
if (!args.name) fail('Missing --name. Example: --name "Fade & Co."')
if (!args.type) fail(`Missing --type. Available: ${readdirSync(TEMPLATES_DIR).join(', ')}`)
if (!existsSync(join(TEMPLATES_DIR, args.type))) {
  fail(`Unknown template "${args.type}". Available: ${readdirSync(TEMPLATES_DIR).join(', ')}`)
}

cpSync(join(TEMPLATES_DIR, args.type), siteDir, { recursive: true })
for (const file of walk(siteDir)) {
  if (/\.(html|css|js|md|txt)$/i.test(file)) {
    fillTokens(file, { SITE_NAME: args.name, SITE_SLUG: args.slug, PUBLIC_APP_HOST })
  }
}

console.log(`\n✅ Created ${siteDir} from the "${args.type}" template (preview mode: hidden from Google for now).`)
console.log(`\nNext steps:`)
console.log(`  1. Preview it:        npx serve sites/${args.slug}`)
console.log(`  2. Customise it:      ask Kimi, and put photos in sites/${args.slug}/images/`)
console.log(`  3. Check it:          node scripts/check-site.mjs ${args.slug}`)
console.log(`  4. Ship it:           git add sites/${args.slug} && git commit -m "Add site: ${args.name}" && git push`)
console.log(`  5. On cPanel:         bash ~/pykk/scripts/update.sh  (creates https://${args.slug}.pykk.uk)\n`)
