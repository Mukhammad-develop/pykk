# Build brief: PYKK Admin Panel (admin.pykk.uk)

Paste this whole brief into Kimi (or save it in your repo as `docs/ADMIN_BRIEF.md` and tell Kimi to read it).

---

## 0. How to work with me

- I'm the founder of PYKK and I'm not a professional developer. Explain things simply.
- **First**, look at what already exists in this repository and tell me in 5–10 bullets what you found. If a stack is already set up (for example Next.js + MySQL + Drizzle), extend it. Don't start a second app.
- If the repo is empty, use this stack:
  - TypeScript (strict), Node 22 LTS, pnpm
  - **Next.js (App Router)** with server components and server actions
  - **MySQL / MariaDB** (the database cPanel provides) with **Drizzle ORM** (`mysql2` driver) and migrations
  - **Zod** for validation, **Vitest** for tests, **Playwright** for one end-to-end test
  - **Tailwind CSS** for styling, and **Recharts** for charts
- Work in the **phases in section 9**. At the start of each phase, show me a short plan and wait for "go". At the end of each phase:
  - run the tests
  - tell me exactly how to check it myself (the commands to run and what to click)
  - update `PROGRESS.md`
  - commit with a clear message
- Never hard-code secrets, prices or domains. Use `.env` (and keep `.env.example` up to date).
- Never invent data. If something isn't tracked yet (for example, SMS before the SMS module exists), show "Not connected yet" instead of fake numbers.

---

## 1. What PYKK is (context)

PYKK builds websites for UK small and local businesses (barbers, beauty salons, cafés, cleaners and so on) for **£4.99 a month** each (the price is set per business in the database).

Each client gets a site at `theirname.pykk.uk`. I collect payments **manually**: I create a payment link myself (for example a Stripe Payment Link), paste it into the admin panel, and the client sees it and pays.

The admin panel is my daily control room. I open **https://admin.pykk.uk** every day to see:
1. which payment links I need to create today, and for how much
2. who hasn't paid yet
3. every statistic about the business

I'll use it mostly on my **iPhone**, so it must be mobile-first and fast.

---

## 2. Domains and routing

- `admin.pykk.uk` serves the **admin panel**, for me only.
- `app.pykk.uk` serves the **client area**, where clients see and pay their bills (section 6).
- `{slug}.pykk.uk` serves each client's website as **static files** from `sites/{slug}/`, served directly by cPanel/Apache (see `docs/KIMI_START.md`). The Next.js app does not serve client sites.
- `pykk.uk` and `www.pykk.uk` stay on my cPanel hosting. The app never serves them.

### Host-based routing (middleware)

- Host `admin.<ROOT_DOMAIN>` serves only the admin routes. Every other path on that host returns 404.
- Admin routes return 404 on any other host.
- Local development: `admin.localhost:3000` and `app.localhost:3000` (tell me to use Chrome for these).
- `ROOT_DOMAIN` comes from env (`pykk.uk` in production, `localhost:3000` locally).
- Make sure `admin`, `app`, `www`, `api`, `mail`, `pay` and `status` are **reserved** and can never be a client's subdomain.

---

## 3. Security (important: client sites live on sibling subdomains)

- **One admin user (me)**, created with a command: `pnpm admin:create --email me@example.com`. It asks for a password in the terminal. There is no public sign-up page.
- Passwords are hashed with **argon2id**. Add optional **TOTP two-factor** (a QR code for my authenticator app) in Settings.
- Session cookie:
  - **host-only** (no `Domain=` attribute, so it isn't shared with `*.pykk.uk`)
  - `Secure`, `HttpOnly`, `SameSite=Strict`
  - 30-day sessions, and I can "log out all devices"
- Login protection:
  - rate limit of 5 attempts per 15 minutes per IP and per email
  - a generic error message
  - a lockout notice in the activity log
- Put CSRF protection on all mutations. Server actions are fine if their origin is checked.
- Admin pages send `X-Robots-Tag: noindex, nofollow` and a strict CSP.
- Optional `ADMIN_IP_ALLOWLIST` env (comma-separated). If it's set, block other IPs.
- Every admin action is written to an **activity log**: who, what, when, before and after.

---

## 4. Data model (create it, or extend what exists)

**businesses**
- `id`, `name`, `slug` (unique), `type` (barber_hair, beauty_spa, cafe, restaurant, cleaning, laundry, retail, local_services, other)
- `owner_name`, `owner_email`, `owner_phone`, `address`, `postcode`, `town`
- `status`: `lead | building | preview | active | paused | suspended | cancelled`
- `price_pence` (default from env, **499**)
- `billing_anchor_date` (the date of the first paid month; later months fall due on the same day)
- `started_at`, `cancelled_at`, `notes`, `created_at`, `updated_at`

**payments** (one row per monthly bill)
- `id`, `business_id`
- `reference`: **6 random characters, uppercase A–Z and digits 0–9** (e.g. `JK891P`), **unique across all payments**, generated with a cryptographically secure random function, retried on collision. It is shown as `#JK891P`.
- `period_start`, `period_end`, `due_date`, `amount_pence` (copied from the business when the row is created)
- `status`: `scheduled | link_ready | paid | overdue | waived | void`
- `payment_link_url` (nullable), `link_added_at`
- `client_token`: a random 32-byte URL-safe token for the client's pay page
- `paid_at`, `paid_method` (`link | cash | bank_transfer | card_in_person | other`), `paid_note`
- `created_at`, `updated_at`

**Tables for other modules.** Create these if they don't exist yet, so the statistics can read them later. If they already exist, read from the existing ones.
- `bookings` (business_id, starts_at, status, source: online, phone or walk_in)
- `sms_messages` (business_id, kind, status, segments, cost_pence, created_at)
- `enquiries` (business_id, created_at)
- `page_views_daily` (business_id, day, views, unique_visitors)

**Admin-only tables**
- **costs:** `month`, `category` (hosting, sim_plan, sms_api, ai, domain, other), `amount_pence`, `note`. I enter my monthly costs so the panel can show profit.
- **activity_log:** `actor`, `action`, `entity`, `entity_id`, `before`, `after`, `ip`, `at`.
- **settings:** key/value pairs:
  - `lead_days` (default **7**)
  - `grace_days` (default **7**)
  - `default_price_pence` (499)
  - `allowed_link_domains` (default `buy.stripe.com, checkout.stripe.com, pay.sumup.com, paypal.me, www.paypal.com, monzo.me`)
  - `client_message_template`
  - `daily_summary_enabled`

---

## 5. How the monthly payments work (the core feature)

### Due dates

- The first month is paid in person when the client signs up. Record it as a `paid` payment (method `card_in_person` or `cash`), and set `billing_anchor_date` to that day.
- Each following month is due on the same day of the month as the anchor date. If that day doesn't exist in a month (29th–31st), use the **last day of that month**. Examples: anchor 31 Jan → 28/29 Feb → 31 Mar. Anchor 15th → the 15th every month.
- Use the **Europe/London** timezone for all date logic. Write unit tests, including month-end days, leap years and UK clock changes.

### A daily job creates the next bill 7 days before it's due

- It runs every day at 06:00 London time. Also give me a manual "Run now" button in Settings.
- For every business with status `active`: if the next due date is **`lead_days` (7) days away or less** and no payment row exists for that period yet, create one with `status = scheduled`, a new reference, `amount_pence = business.price_pence` and a new `client_token`.
- The job must be **idempotent**: running it twice creates nothing twice. Enforce this with a unique constraint on (business_id, period_start).
- Also mark payments `overdue` when `due_date` has passed and the status is still `scheduled` or `link_ready`.
- **Host-agnostic scheduling:** expose `POST /internal/cron/daily`, protected by a `CRON_SECRET` header. Document how to call it from a **cPanel Cron Job** with `curl`. Also run it on server start as a safety net.

### Adding the payment link

- On each `scheduled` payment, I paste a link into an input and press **Save**. Validation:
  - it must be `https://`
  - the domain must be in `allowed_link_domains`, otherwise show a clear error and a "change allowed domains" hint
  - maximum 500 characters
- If the link is a **Stripe Payment Link** (`buy.stripe.com`), offer a checkbox (on by default) to append `?client_reference_id=JK891P`. This lets the optional Stripe webhook in Phase 5 mark it paid automatically.
- After saving: status becomes `link_ready`, `link_added_at` is set, and the client can now see it (section 6).
- A **"Copy message for client"** button copies a WhatsApp/SMS-ready text built from `client_message_template`. The default is:
  `Hi {owner_name}, your PYKK payment #{reference} for {business_name} (£{amount}) is due on {due_date_long}. You can pay securely here: {client_pay_url}. Thank you!`
  Here `{client_pay_url}` is `https://app.pykk.uk/pay/{reference}?t={client_token}`.
- I can edit or replace the link later (logged).

### Marking as paid

- A **Mark paid** button asks for the date (default today) and the method (default `link`), with an optional note. Status becomes `paid`.
- **Undo** is available for 10 minutes (logged).
- **Waive** (free month) and **Void** (created by mistake) are available; both need a reason.

### Date display format

- Long format everywhere: **"2nd October 2026"** (ordinal day, full month name, year). Write a tested helper: 1st, 2nd, 3rd, 4th, 11th, 12th, 13th, 21st, 22nd, 23rd, 31st.
- Amounts display as **£4.99** (from pence, `en-GB`).

---

## 6. What the client sees (keep it minimal)

**Pay page:** `https://app.pykk.uk/pay/{reference}?t={client_token}`
- It works without a login. The page is valid only if the token matches, compared in constant time; otherwise show a 404.
- It shows the PYKK logo, the business name, the reference `#JK891P`, the period, the due date ("2nd October 2026"), the amount (£4.99), and a big **Pay now** button that opens my pasted link.
- If there's no link yet: "Your payment link will appear here soon."
- If it's paid: "Paid on 3rd October 2026 — thank you."
- It has `noindex` set and shows nothing else about the business.

**Client portal:** if an owner login exists in this repo, add a "Billing" card to their dashboard with the same information and their payment history. If it doesn't exist, skip this; the pay page is enough.

---

## 7. Admin panel pages

The top bar has the PYKK logo, the page name and a search box (business name, slug or reference). On mobile, use a bottom tab bar: **Today · Payments · Businesses · Stats · More**.

### 7.1 Today (the home page, the most important screen)

**Four summary cards at the top:**
1. **Links to create:** the count and total, e.g. "3 links · £14.97". These are `scheduled` payments due within `lead_days`.
2. **Waiting for payment:** `link_ready`, not yet due. Count and total.
3. **Overdue:** count, total and the oldest number of days overdue. Shown in red.
4. **Collected this month:** the total paid this calendar month, compared with last month (up or down).

**Table: "Payment links to create today"**, sorted by due date (soonest first):

| Business | Reference | Due date | Amount | Action |
|---|---|---|---|---|
| Fade & Co. | #JK891P | 2nd October 2026 | £4.99 | [paste link] [Save] |

- The business name links to the business page. Show "in 5 days" under the date.
- On mobile, each row becomes a card with a large paste field and Save button.
- After saving, the row moves smoothly to "Waiting for payment" and a **Copy message for client** button appears.

**Below the table:**
- a "Waiting for payment" list with **Mark paid** and **Copy message** buttons
- an "Overdue" list in red, with the number of days overdue and a button to suspend the site (with a confirmation)
- "Today's activity": bookings today (all clients), texts sent today, new enquiries and new businesses

### 7.2 Payments

- All payments, with filters (status, month, business, method), search by reference, and **Export CSV**.
- Clicking a row shows the payment details, link history and activity log.

### 7.3 Businesses

- A list with: name, subdomain (clickable, opens the site), type, town, status, price, next due date, last payment status, and "client since".
- Filters by status and type. Add a button, and edit.
- **Business detail page:**
  - profile and status actions (pause, suspend, reactivate, cancel)
  - price change (applies from the next bill)
  - billing anchor
  - payment history
  - quick stats (see 7.4): bookings, SMS, page views, enquiries this month, and the lifetime value
  - notes

### 7.4 Statistics (every number I care about)

Every card shows the number, the change from the previous period, and a small chart. There's a period picker (this month, last month, last 3, 6 or 12 months, all time). Where a module isn't connected yet, show "Not connected yet".

**Money**
- MRR (monthly recurring revenue) = the sum of `price_pence` of `active` businesses
- ARR = MRR × 12
- Collected (in the period), Outstanding (link_ready + scheduled), Overdue
- Expected in the next 30 days (from due dates)
- Lifetime revenue, and average revenue per client
- **Profit** = collected − costs (from the `costs` table), per month. Show a chart of revenue, costs and profit.
- Payment behaviour:
  - on-time rate (paid on or before the due date)
  - average days from link added to paid
  - how many links are still unpaid

**Clients**
- The number of businesses by status (active, preview, paused, suspended, cancelled)
- New clients per month (chart), cancellations per month
- **Churn rate** = cancelled in the month ÷ active at the start of the month
- Average client lifetime (months)
- A breakdown by business type and by town (tables plus a bar chart)

**Websites and customers of my clients**
- Page views and unique visitors per day (chart), with the top 10 sites
- Bookings: total, by source (online, phone, walk-in), cancellations and the no-show rate, per business
- Enquiries per month

**SMS**
- Texts sent today and this month, failed texts, and cost this month
- Texts per business (top 10)
- The SIM device's last heartbeat (online or offline), if that module exists

**System**
- Errors in the last 24 hours (if logging exists), daily job last run time and result, and database size

**Implementation notes:**
- Page views are collected **without cookies**. Every client site includes a tiny beacon (`<script src="https://app.pykk.uk/pv.js" data-site="{slug}" defer></script>`, under 1 KB). It calls `POST https://app.pykk.uk/api/pv`, which increments `page_views_daily`. Validate the slug, rate-limit per IP, and allow CORS only from `https://*.pykk.uk`. For unique visitors, use a daily-rotating salted hash of IP + user agent, and never store the raw IP.
- Put statistics queries in one tested module (`lib/stats.ts`). Cache heavy queries for 5 minutes.

### 7.5 Costs

A simple monthly table I can edit (hosting, SIM plan, SMS API, AI, domain, other). This feeds the profit calculation.

### 7.6 Activity log

A searchable list of everything that happened, with filters.

### 7.7 Settings

- Lead days, grace days, default price and allowed link domains
- The client message template, with a live preview
- Daily summary on or off, 2FA setup, log out all devices
- The "Run daily job now" button

---

## 8. Daily summary (optional but useful)

If `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set, the daily job sends me one message at 08:00 London time:

> PYKK today: 3 links to create (£14.97) · 2 waiting (£9.98) · 1 overdue (£4.99, 4 days) · collected this month £124.75

Fall back to email if the Telegram values aren't set but email is configured. Otherwise skip it.

---

## 9. Phases (do them in order; plan first and wait for "go" each time)

1. **Foundations:**
   - check the repo and set up the stack
   - host routing for `admin.` and `app.`
   - the admin login, `pnpm admin:create` and the session security
   - the activity log
2. **Businesses and payments:**
   - the schema and migrations
   - the due-date logic with unit tests
   - reference generation with tests
   - the daily job with its idempotency test
   - the cron endpoint
3. **The Today page:**
   - the cards, the "links to create" table and the link validation
   - Mark paid, Waive, Void and Undo
   - Copy message for client
   - mobile layout
4. **The client pay page** (`app.pykk.uk/pay/...`), with an end-to-end test covering: create business → job creates a payment → paste link → the client page shows Pay now → mark paid → the client page shows Paid.
5. **Optional Stripe webhook:**
   - if `STRIPE_WEBHOOK_SECRET` is set, `checkout.session.completed` with `client_reference_id` matching a reference marks that payment paid (idempotent, logged)
   - tell me click by click how to create the webhook in the Stripe dashboard
6. **Statistics and costs pages**, with a "Not connected yet" state for missing modules.
7. **Settings, the daily summary, CSV export and 2FA.**
8. **Deploy:**
   - deploy to **cPanel "Setup Node.js App"**, exactly as described in `docs/KIMI_START.md` (standalone build via GitHub Actions to the `deploy` branch, `update.sh`, migrations, restart)
   - include a health check at `/healthz`
   - write `DEPLOY.md` with the exact cPanel steps and every env variable

---

## 10. Environment variables (put them in `.env.example`)

```
ROOT_DOMAIN=pykk.uk
DATABASE_URL=
SESSION_SECRET=
CRON_SECRET=
DEFAULT_PRICE_PENCE=499
ADMIN_IP_ALLOWLIST=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
STRIPE_WEBHOOK_SECRET=
EMAIL_API_KEY=
EMAIL_FROM=
```

---

## 11. Done means

- On my iPhone at `https://admin.pykk.uk`, after logging in, I see "Links to create", with rows like `Fade & Co. | #JK891P | 2nd October 2026 | £4.99`, exactly 7 days before each due date.
- I paste a link and press Save. The client's pay page shows **Pay now**, and I can copy a ready-made message for them.
- I mark it paid, and every statistic updates.
- All tests pass. `PROGRESS.md` and `DEPLOY.md` explain how to run, check and deploy everything.

**Start now:** look at the repository, tell me what you found, then show me your plan for Phase 1 and wait for "go".
