// End-to-end test of the whole billing circle, per docs/ADMIN_BRIEF.md phase 4:
// create business → daily job creates a payment → paste link → the client page
// shows Pay now → mark paid → the client page shows Paid.
//
// Runs against a live app instance (BASE_URL) with the dev/CI database.
// Env: BASE_URL (default http://localhost:4577), ADMIN_EMAIL, ADMIN_PASSWORD,
// DATABASE_URL (for reading the client token out of the test database).
import { chromium } from 'playwright'
import mysql from 'mysql2/promise'

const base = process.env.BASE_URL || 'http://localhost:4577'
const email = process.env.ADMIN_EMAIL || 'e2e@pykk.uk'
const password = process.env.ADMIN_PASSWORD || 'e2e-password-123'

let failures = 0
function check(label, value) {
  console.log(`${value ? '✓' : '✗ FAIL'} ${label}`)
  if (!value) failures++
}

const browser = await chromium.launch()
const context = await browser.newContext()
const page = await context.newPage()

try {
  // 0. repeatable: clear any previous e2e leftovers
  const cleanup = await mysql.createConnection(process.env.DATABASE_URL)
  await cleanup.execute(
    `DELETE p FROM payments p JOIN businesses b ON b.id = p.business_id WHERE b.slug = 'e2etest'`,
  )
  await cleanup.execute(`DELETE FROM businesses WHERE slug = 'e2etest'`)
  await cleanup.end()

  // 1. log in
  await page.goto(`${base}/login`, { waitUntil: 'networkidle' })
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${base}/`, { timeout: 15000 })
  check('admin login works', true)

  // 2. create a business (first bond bill is created with it)
  await page.goto(`${base}/businesses/new`, { waitUntil: 'networkidle' })
  await page.fill('input[name="name"]', 'E2E Barbers')
  await page.fill('input[name="slug"]', 'e2etest')
  await page.fill('input[name="pricePounds"]', '4.99')
  await page.fill('input[name="anchorDate"]', '2026-08-31')
  await page.fill('input[name="graceDays"]', '7')
  await page.click('button[type="submit"]')
  await page.waitForURL(`${base}/businesses`, { timeout: 15000 })
  check('business created', (await page.textContent('body')).includes('E2E Barbers'))

  // 3. run the daily job → a second bill appears inside the lead window
  await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  await page.click('text=Run daily job now')
  await page.waitForTimeout(4000)
  const body = await page.textContent('body')
  check('daily job ran from the panel', /bill\(s\) created|0 bill/.test(body))

  // 4. find the scheduled bill's reference + token from the database
  const connection = await mysql.createConnection(process.env.DATABASE_URL)
  const [rows] = await connection.execute(
    `SELECT p.reference, p.client_token FROM payments p
     JOIN businesses b ON b.id = p.business_id
     WHERE b.slug = 'e2etest' AND p.status = 'scheduled'
     ORDER BY p.due_date LIMIT 1`,
  )
  await connection.end()
  const bill = rows[0]
  check('a scheduled bill exists', Boolean(bill))
  const payPath = `/pay/${bill.reference}?t=${encodeURIComponent(bill.client_token)}`

  // 5. pay page before a link: "link will appear here soon"
  const before = await page.goto(`${base}${payPath}`)
  check('pay page answers 200', before.status() === 200)
  const beforeText = await page.textContent('body')
  check('shows business name and amount', beforeText.includes('E2E Barbers') && beforeText.includes('£4.99'))
  check('shows "link will appear here soon"', beforeText.includes('will appear here soon'))

  // 6. wrong token → 404
  const wrong = await page.goto(`${base}/pay/${bill.reference}?t=wrong-token`)
  check('wrong token gives 404', wrong.status() === 404)

  // 7. paste a link on the Today page → Pay now appears
  await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  const billRow = page.locator('li:has-text("E2E Barbers")').first()
  await billRow.locator('input[placeholder*="buy.stripe.com"]').fill('https://buy.stripe.com/e2e-test-link')
  await billRow.locator('button:has-text("Save")').click()
  await page.waitForTimeout(3000)
  await page.goto(`${base}${payPath}`)
  const afterText = await page.textContent('body')
  check('after saving a link, "Pay now" appears', afterText.includes('Pay now'))
  const payHref = await page.getAttribute('a:has-text("Pay now")', 'href')
  check('Pay now points at the pasted link (with the reference appended)', payHref === 'https://buy.stripe.com/e2e-test-link?client_reference_id=' + bill.reference)

  // 8. mark paid → the pay page shows Paid
  await page.goto(`${base}/`, { waitUntil: 'networkidle' })
  const waitingSection = page.locator('section', { has: page.locator('h2', { hasText: 'Waiting for payment' }) })
  await waitingSection.locator('li:has-text("E2E Barbers")').first().locator('button:has-text("Mark paid")').click()
  await page.locator('button:has-text("Confirm paid")').click()
  await page.waitForTimeout(3000)
  await page.goto(`${base}${payPath}`)
  const paidText = await page.textContent('body')
  check('after mark paid, the pay page says Paid', paidText.includes('Paid on') && paidText.includes('thank you'))
} finally {
  await browser.close()
}

console.log(failures === 0 ? '\nE2E PASSED' : `\nE2E FAILED (${failures} checks)`)
process.exit(failures === 0 ? 0 : 1)
