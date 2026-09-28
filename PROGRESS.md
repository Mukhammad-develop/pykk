# PROGRESS

## Done

- **P0 — Setup** (25 Sep 2026): `pykk` is now its own git repository, connected to
  GitHub (`Mukhammad-develop/pykk`). Folder layout created (`web/`, `sites/_templates/`,
  `scripts/`, `.github/workflows/`). `.gitignore`, `PROGRESS.md` and `DECISIONS.md`
  in place. `index.html` untouched.

- **P1 — Prove the hosting works** (25 Sep 2026): minimal Next.js app in `web/` with a
  "PYKK is running" page and `/healthz`; GitHub Action builds and publishes the `deploy`
  branch; `start.js` and `scripts/update.sh`; `web/.env.example`; `docs/DEPLOY.md`.
  Full cPanel setup done: `~/pykk` + `~/pykk-web` clones, MySQL database, domains,
  Node 22 app, server `.env`. **https://admin.pykk.uk/healthz answers with a padlock.**
  Two server-only bugs found and fixed on the way: `set -u` vs cPanel's activate script,
  and pnpm's symlinked layout breaking in the release (solved with `node-linker=hoisted`).
- **Homepage auto-deploy** (founder request during P1): the repo's `index.html` is the
  source of truth for the live homepage. `update.sh` copies it to `~/pykk.uk` on every
  run, saving the previous live file as `index.html.bak` first.

- **P2 — Client site workflow** (25 Sep 2026): 4 starter templates in `sites/_templates/` (`barber`, `beauty`, `cafe`, `services`) —
  mobile-first, accessible, clearly different designs, `[[NEEDS INFO: …]]` placeholders
  for every unknown fact. `scripts/new-site.mjs` (create from template / `--publish`),
  `scripts/check-site.mjs` (HTML validity, links, image weight + `--webp`, placeholders,
  phone-width layout, axe accessibility — all passing on the `demo` site).
  `update.sh` now creates missing client subdomains automatically via `uapi` and starts
  AutoSSL (host confirmed: `uapi` works). `/pv.js` placeholder route added so the beacon
  tag never 404s. `docs/NEW_CLIENT.md` written. Mac-side tooling lives in a root
  `package.json` (never deployed). **https://demo.pykk.uk live with a padlock**
  (confirmed by the founder on iPhone). `AGENTS.md` written — project memory for new chats.

- **P3 Phase 1 — Foundations** (25 Sep 2026): Drizzle ORM + mysql2 with migrations
  (`admin_users`, `admin_sessions`, `login_attempts`, `activity_log`); local dev
  database via `docker compose` (MariaDB 10.11); host-based routing middleware
  (admin/app hosts, single-host fallback for `/pay/*`, `/api/pv`, `/pv.js`;
  `/healthz` everywhere; unknown hosts 404; IP allowlist never blocks public paths);
  production CSP with per-request nonce + `X-Robots-Tag: noindex`; argon2id login
  with 5-per-15-min rate limiting (per IP and per email, lockouts logged);
  DB-backed 30-day revocable sessions (hashed tokens); `create-admin.mjs` ships in
  the release; Tailwind v4 for the panel. 28 unit tests pass; full release rehearsal
  verified locally (migrations, admin creation, argon2, host routing). Post-deploy
  hunt: Next.js server-action POSTs 404 on this server's Node 22 (and on 24 — works
  on 25), so all mutations were rebuilt as JSON route handlers; the full login flow
  is proven on Node 22 in Docker with a real browser. **Login verified in production
  by the founder (iPhone, Safari) — Phase 1 complete.**

- **P3 Phase 2 — Businesses and the payment engine** (25 Sep 2026): `businesses` and
  `payments` tables (plus `costs`, `settings` and stub tables for the statistics
  phase); due-date engine on the Europe/London calendar (month-end clamping, leap
  years, clock changes — all unit-tested); 6-char crypto references with collision
  retry; the daily job (creates bills 7 days before due, marks overdues) proven
  idempotent by DB tests; `POST /internal/cron/daily` (CRON_SECRET) plus a
  start.js safety-net run on every boot; "Add business" screen (records the first
  month as paid, anchors billing); home page with businesses + latest payments and
  a "Run daily job now" button; CI now runs DB-backed tests against a MariaDB
  service. 56 tests pass; full flow rehearsed on Node 22 (login → add business →
  job creates the bill → visible in the list).

- **P3 Phase 3 — Today page and the grace engine** (27 Sep 2026): the Today page
  (4 cards: links to create, waiting, overdue, collected this month; "bond bills
  needing a link" with paste-link + Stripe reference append; waiting list with
  Mark paid / Waive / Void; overdue in red; "Marked paid recently" with 10-minute
  Undo). Add business now creates the **first bond bill** (due on the anchor date —
  no in-person payment). Grace engine: daily job auto-suspends a business whose
  unpaid bill passes `due + grace_days` and swaps its site to a "temporarily
  turned off" page (backup kept, self-healing); marking paid or waiving restores
  site and business. Link validation is just https + length (no domain whitelist,
  founder decision). Panel layout with mobile bottom tabs; businesses list +
  detail (status actions, price & notes, payment history). 72 tests pass; full
  grace cycle rehearsed end-to-end on Node 22 (suspend → file swap → pay →
  restore).

- **P4 — The site factory** (27 Sep 2026): the panel builds client websites
  itself. `/businesses/[id]/website`: per-category intake form (contact, location,
  7-day hours, services & prices with presets, extras per type, additional info),
  photo upload (JPG/PNG → WebP ≤1600px into `sites/{slug}/images/`). The pipeline:
  AI draft via OpenRouter (`kimi-k2` by default, configurable) against the
  `CLIENT_SITE_GUIDE` rules → server-side validator (beacon slug, noindex, footer
  link, one h1, no tokens, never "subscription", bond section) → one retry →
  guaranteed deterministic fallback template. Then: files written, git
  commit+push from the server (fine-grained PAT), subdomain + AutoSSL via uapi —
  all reported in `websiteNote`. Builds run in the background with DB status
  polling. **Rehearsed live on Node 22: real OpenRouter generation passed
  validation first try; fallback ships a full site with no key.** 88 tests pass.

- **P5 — The client pay page** (27 Sep 2026): `/pay/{reference}?t={token}` — no
  login, constant-time token check (wrong token → plain 404), branded page with
  business name, reference, period, due date, amount and a big **Pay now** button
  opening the pasted link; states for "link coming soon", overdue, paid and waived;
  `noindex`, nothing else about the business shown. End-to-end test
  (`web/e2e/pay-page.test.mjs`) drives the whole circle — create business → daily
  job creates the bill → paste link → Pay now → mark paid → Paid — and now runs in
  CI against the built standalone with the MariaDB service (11/11 checks pass).

- **P6 — The "real site" upgrade** (28 Sep 2026): the bond pitch is OFF public
  client sites (PYKK-internal content moves to the future client area; the
  validator now *rejects* bond content). Sites get **design moods** — Dark & bold,
  Light & elegant, Warm & rustic, Bright & practical — real structure variety
  chosen at intake, so two clients of the same type no longer look alike.
  Personality intake: the owner's story, real client-supplied reviews (used
  verbatim, never invented — a "What customers say" section appears only when
  provided), Instagram/Facebook links, and a hero-photo backdrop option. The
  baseline renderer now renders in the chosen mood too (CSS-variable palettes).
  `CLIENT_SITE_GUIDE.md` updated to match. 94 tests pass; rehearsed live on
  Node 22: AI generation with mood + reviews + story + socials passed every check.

- **P7 — The client area** (28 Sep 2026): every client gets their own admin panel
  at **`{slug}.pykk.uk/admin`** — a static shell (in git with the site) that loads
  the panel app (`client-panel.js`) from the app host, so panel updates deploy
  once for everyone. Login is founder-issued email+password (no signup; "Client
  access" card on the business page creates/resets it and copies a ready message).
  Bearer-token sessions (no cookies — works cross-subdomain on iPhone Safari);
  every client API is CORS-locked to `*.pykk.uk` origins. Inside: **Bond** (price,
  next due, bills with Pay buttons, the bond explanation), **Website info** (edit
  hours, services & prices, real reviews, story → Save → the same factory pipeline
  regenerates the site automatically), **Bookings** (list; actions arrive with the
  booking form phase). `/admin` deliberately stays reachable while a site is
  suspended, so the client can pay to come back. Rehearsed on Node 22: full loop
  — issue login → client logs in → sees bond → edits hours → site rebuilds itself
  with the new times. 95 tests pass.

- **P8 — Bookings end-to-end** (28 Sep 2026): client websites take real
  appointments. Intake gets "Takes bookings on the website"; the generated site
  then includes a booking form (service, date, time on the hour/half-hour, name,
  phone, note) driven by app-served `booking.js` — one update point for every
  site. `POST /api/booking` is public but CORS-locked to `*.pykk.uk`, rate-limited
  (10/IP/hour), and validates for real: the business's opening hours (Europe/London
  wall clock, BST-aware), no past slots, no double-booking, services must match
  the intake. Bookings land in the client's **Bookings tab** with Confirm / Done /
  No-show / Cancel actions, and the founder's Today page counts today's bookings
  across all clients. Availability logic is unit-tested (closed days, past,
  collisions, clock change); full flow rehearsed on Node 22 — 106 tests pass.

## Next

- **Finish P8 on the server:** push → Action green → `update.sh` → enable bookings
  on a test business (intake → Details → "Takes bookings") → rebuild → book a slot
  on the public site → see it in the client's Bookings tab.
- **P9 — the "awesome" pass:** site quality overhaul (richer mood design systems,
  agency-grade generation brief, map embed, gallery niceties).
- **Last:** a final review of `DEPLOY.md`, `NEW_CLIENT.md` and `PROGRESS.md` so someone
  new could follow them.
- **Last:** a final review of `DEPLOY.md`, `NEW_CLIENT.md` and `PROGRESS.md` so someone
  new could follow them.

## Waiting on the founder

- ~~`docs/ADMIN_BRIEF.md`~~ — received 25 Sep 2026 (in `docs/`).
- Answered by the host so far: **Node 22 is available** (used for the app); **one Node
  app cannot serve two domains**, so the fallback is active — `PUBLIC_APP_HOST=admin.pykk.uk`,
  and `/pay/*`, `/api/pv`, `/healthz` will live on the admin host; **`uapi` works** in
  cPanel Terminal, so client subdomains are created automatically by `update.sh`.
- Still to confirm: MySQL or MariaDB (the code works with either; dev database is
  MariaDB 10.11).
