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

require('./server.js')
