// Creates (or re-passwords) the single admin user, interactively.
//
//   Locally:  pnpm admin:create
//   Server:   node create-admin.mjs     (bundled copy, sits next to .env)
//
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline'
import { eq } from 'drizzle-orm'

const here = path.dirname(fileURLToPath(import.meta.url))
try {
  process.loadEnvFile(path.join(here, '.env'))
} catch {
  try {
    process.loadEnvFile(path.join(process.cwd(), '.env.local'))
  } catch {
    // environment may provide the values
  }
}

// ---- input handling ---------------------------------------------------------
// Interactive (TTY): prompt with masked password input.
// Piped stdin (tests/automation): answers come from successive input lines.
const isPiped = !process.stdin.isTTY
let pipedLines: string[] = []

if (isPiped) {
  const data = await new Promise<string>((resolve) => {
    let buf = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => {
      buf += chunk
    })
    process.stdin.on('end', () => resolve(buf))
    process.stdin.resume()
  })
  pipedLines = data.split(/\r?\n/)
}

let ask: (question: string, opts?: { hidden?: boolean }) => Promise<string>

if (isPiped) {
  ask = (question, { hidden = false } = {}) => {
    const answer = (pipedLines.shift() ?? '').trim()
    process.stdout.write(question + (hidden && answer ? '********' : answer) + '\n')
    return Promise.resolve(answer)
  }
} else {
  // One shared readline for all questions — a fresh one per question would
  // swallow buffered input (e.g. when pasting password + confirmation at once).
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  const rli = rl as unknown as {
    _writeToOutput: (s: string) => void
    output: NodeJS.WritableStream
  }
  const originalWrite = rli._writeToOutput.bind(rl)
  let masking = false
  let activeQuestion = ''
  rli._writeToOutput = (s: string) => {
    if (masking && s !== activeQuestion && !s.includes('\n')) {
      rli.output.write('*')
    } else {
      originalWrite(s)
    }
  }
  ask = (question, { hidden = false } = {}) =>
    new Promise((resolve) => {
      activeQuestion = question
      masking = hidden
      rl.question(question, (answer) => {
        masking = false
        resolve(answer.trim())
      })
    })
}
// -----------------------------------------------------------------------------

const emailArgIndex = process.argv.indexOf('--email')
const emailFromArg = emailArgIndex !== -1 ? process.argv[emailArgIndex + 1] : undefined

const email = (emailFromArg ?? (await ask('Admin email: '))).toLowerCase()
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('That does not look like an email address.')
  process.exit(1)
}

const password = await ask('Password (min 12 characters): ', { hidden: true })
if (password.length < 12) {
  console.error('Password too short — use at least 12 characters.')
  process.exit(1)
}
const confirm = await ask('Password again: ', { hidden: true })
if (password !== confirm) {
  console.error('Passwords do not match.')
  process.exit(1)
}

const { getDb } = await import('../db/index.js')
const { adminUsers, activityLog } = await import('../db/schema.js')
const { hashPassword } = await import('../lib/auth/password.js')

const db = getDb()
const passwordHash = await hashPassword(password)
const existing = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1)

if (existing.length > 0) {
  await db.update(adminUsers).set({ passwordHash }).where(eq(adminUsers.email, email))
  await db.insert(activityLog).values({
    actor: 'system',
    action: 'admin.password_reset',
    entity: 'admin_user',
    entityId: email,
  })
  console.log(`✔ Password updated for ${email}`)
} else {
  await db.insert(adminUsers).values({ email, passwordHash })
  await db.insert(activityLog).values({
    actor: 'system',
    action: 'admin.created',
    entity: 'admin_user',
    entityId: email,
  })
  console.log(`✔ Admin user created: ${email}`)
}
process.exit(0)
