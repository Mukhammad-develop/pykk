// PYKK app launcher for cPanel (CloudLinux Passenger).
//
// 1. Loads .env from this folder if it exists (Node's built-in parser — no
//    extra dependencies, so it works in the minimal standalone release).
// 2. Reads VERSION.txt so the app can report its version at /healthz.
// 3. Starts the standalone Next.js server. Passenger provides PORT.
'use strict'

const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '.env')
if (fs.existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath)
  } catch (err) {
    console.error('[pykk] Could not parse .env:', err.message)
  }
}

try {
  const firstLine = fs
    .readFileSync(path.join(__dirname, 'VERSION.txt'), 'utf8')
    .split('\n')[0]
  process.env.APP_VERSION = firstLine.trim()
} catch {
  process.env.APP_VERSION = process.env.APP_VERSION || 'unknown'
}

if (!process.env.PORT) {
  process.env.PORT = '3000'
}

// Bind to all interfaces: the standalone server otherwise binds to the machine
// hostname only (HOSTNAME is always set by Docker/Passenger), which would make
// the startup safety-net call to 127.0.0.1 fail.
process.env.HOSTNAME = '0.0.0.0'

require('./server.js')

// Safety net: run the daily billing job shortly after boot. The cPanel Cron
// Job also calls /internal/cron/daily every morning, but if that ever fails,
// bills are still created after every deploy or restart.
if (process.env.DATABASE_URL && process.env.CRON_SECRET) {
  const port = process.env.PORT
  const secret = process.env.CRON_SECRET
  setTimeout(() => {
    fetch(`http://127.0.0.1:${port}/internal/cron/daily`, {
      method: 'POST',
      headers: { authorization: `Bearer ${secret}` },
    })
      .then(async (res) => {
        const text = await res.text()
        console.log('[pykk] startup daily job:', res.status, text.slice(0, 200))
      })
      .catch((err) => console.error('[pykk] startup daily job failed:', err.message))
  }, 5000)
}
