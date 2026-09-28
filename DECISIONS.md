# DECISIONS

Short reasons for technical choices, newest first.

- **Site quality is owned by the generation brief, not the model.** The craft bar
  (hero anatomy, section rhythm, depth per mood, map embed, sticky call, gallery
  hover, footers, transitions) lives in the system prompt; moods are full design
  languages. The model stays configurable (`OPENROUTER_MODEL`) and the validator
  + baseline floor are unchanged — better brief, same safety rails.
- **Optional `script.js` is validated, not trusted.** Tiny (≤4 KB), no eval, no
  external URLs beyond our hosts — anything else is dropped silently and the site
  still ships. Stale scripts from older builds are removed on rebuild.
- **Booking behavior is one app-served script (`/booking.js`), not per-site JS.**
  The generated form carries data attributes (slug, api host); the shared script
  posts to `/api/booking`. One update point, like the client panel.
- **Availability is computed on the Europe/London wall clock** (`lib/booking.ts`,
  BST-aware `slotToUtcIso`): opening hours per weekday, hour/half-hour starts, no
  past slots, no double-booking. The storage column is a real UTC timestamp.
- **`/api/booking` is public but fenced**: CORS-locked to `*.pykk.uk`, rate-limited
  by IP (10/hour, stored on the booking row for abuse review), service names must
  match the business's intake, and `enableBooking` must be on for that business.
- **The client area is a static shell per site + one app-served panel app.**
  `{slug}.pykk.uk/admin` is a tiny static page (in git with the site) that loads
  `client-panel.js` from the app host — cPanel/Apache keeps serving client sites
  as pure static files, and panel updates deploy once for every client.
- **Client auth is bearer tokens, not cookies.** iPhone Safari blocks
  cross-subdomain cookies (ITP), so login returns a 30-day token the shell keeps
  in localStorage; every `/api/client/*` call carries it and it unlocks exactly
  one business (`business_id` scoping everywhere). Founder-issued credentials —
  no signup. Client login is rate-limited through the same `login_attempts`
  machinery as the admin login.
- **Client APIs are CORS-locked to `*.pykk.uk` origins** (regex-echoed allow
  header, preflight handler), and `/api/client/` is exempt from the admin IP
  allowlist — clients log in from their own subdomains.
- **Content edits regenerate through the same factory pipeline** (PUT
  `/api/client/website` → `buildSite`), so there is exactly one way a site gets
  made, whether the founder, an AI chat, or the client drives it.
- **The e2e test runs against the built standalone in CI**, not the dev server:
  the workflow assembles the release, migrates the MariaDB service database,
  creates an admin, boots `start.js`, and drives the full billing circle with
  Playwright. Vitest excludes `e2e/` (it runs via `pnpm e2e` in its own step).
- **Site builds run fire-and-forget with DB-backed status.** The build-website
  route kicks off `buildSite()` without awaiting it; `websiteStatus` on the
  business row is the progress channel, and the page polls it. No queue infra
  needed on shared hosting; Passenger keeps the process alive between requests.
- **The AI output contract is `=== index.html ===` / `=== styles.css ===`** blocks,
  validated server-side (beacon slug, noindex, footer link, one h1, no tokens,
  never "subscription", bond section, CSS size). One retry with the failures fed
  back, then the deterministic **baseline renderer** as the guaranteed floor —
  proven live: kimi-k2 passed validation first try, and the fallback path ships a
  complete site with no API key.
- **Photos are converted to WebP at upload** (sharp, ≤1600px, quality 82) into
  `sites/{slug}/images/`, numbered from the count on disk so multi-request uploads
  can't overwrite each other. Filenames are fed to the AI for the gallery.
- **The "turned off" mechanism is a file swap in `SITES_DIR`** (`lib/site-control.ts`):
  the real `index.html` is backed up as `index.html.pykk-paused` and a paused page
  (with a `pykk:paused` marker) takes its place. Idempotent and self-healing after
  git pulls; restored on mark-paid, waive or reactivate. Auto-suspend runs in the
  daily job when `today > dueDate + graceDays` (per-business grace, setting default 7).
- **The first bond bill is created with the business** (founder's model change: no
  in-person first payment). Due on the anchor date, payable via a pasted pay link;
  clients get the grace period from day one.
- **Undo-paid is server-driven** via a "Marked paid recently" Today section: after
  marking paid the row leaves the waiting list, so the 10-minute undo window
  (`paid_recorded_at` + 10 min) is computed per row on the server — component
  state alone would lose it.
- **The site factory (P4) is server-side, but git stays the source of truth.** The
  app generates client sites from panel intake + photos, validates the output,
  then commits and pushes from the server with a fine-grained GitHub PAT scoped
  to the pykk repo only (Contents: write) — stored in the server `.env` like every
  other secret. Founder approved the token's blast radius (write to a public repo).
- **AI drafting via OpenRouter (`OPENROUTER_API_KEY` / `OPENROUTER_MODEL`) with a
  guaranteed floor.** The model drafts the site against a strict spec; a validator
  checks it (beacon slug, noindex, footer link, no leftover tokens/placeholders,
  never "subscription", valid HTML); one retry with the error fed back; if it still
  fails, the app falls back to rendering the proven template with the intake data —
  every save ships a working site.
- **Subdomains are created by the app via `uapi`** (founder decision: full
  zero-touch). Called without a shell, slug strictly validated; failures fall back
  to the manual cPanel steps. `update.sh` keeps its own uapi step for git-made sites.
- **No allowed-domain list for payment links** (founder decision: single admin,
  not a fraud vector). Link validation is just `https://` + max 500 chars.
- **Billing dates are ISO strings, never instants.** All due-date logic works on
  'YYYY-MM-DD' strings on the Europe/London calendar; "today" comes from `Intl`
  with the London timezone. UK clock changes can't shift a due date (unit-tested
  on both transition weekends).
- **The startup safety net is a loopback fetch in `start.js`, not Next
  instrumentation.** `instrumentation.ts` gets bundled for the edge runtime, which
  refuses `node:` imports from the DB layer; `start.js` simply POSTs to
  `/internal/cron/daily` (with `CRON_SECRET`) a few seconds after boot. To make
  that reachable, `start.js` forces `HOSTNAME=0.0.0.0` — otherwise the standalone
  server binds to the machine hostname only and loopback fails (true in Docker
  and under Passenger).
- **CI runs the DB-backed tests against a MariaDB 10.11 service container** (the
  workflow migrates it first); on the Mac, `vitest.config.ts` loads `.env.local`
  so the same tests hit the Docker dev database. Tests skip cleanly with no
  `DATABASE_URL`.
- **JSON route handlers for all mutations; no server actions.** Deep in the P3.1
  deploy we found Next.js server-action POSTs (multipart bodies with `$ACTION_`
  fields) dying with "Failed to find Server Action" 404s on this server's Node
  (22.23.2) — reproduced in clean Docker runs on Node 22 AND Node 24, while the
  same build works on Node 25. cPanel only offers Node 22, so all mutations are
  plain `fetch()` POSTs with JSON bodies to route handlers. CSRF protection comes
  from an origin check + `SameSite=Strict` cookie + JSON content-type.
- **DB-backed 30-day sessions.** The cookie holds a random 32-byte token; the table
  holds only its SHA-256 hash — a leaked database doesn't leak usable sessions, and
  sessions are revocable per device ("log out all devices" comes with Settings).
- **argon2id (19 MiB / 2 / 1) for passwords** — the OWASP profile, gentle on shared
  hosting. `pnpm.onlyBuiltDependencies` lets its prebuilt binary install under pnpm 10.
- **MariaDB 10.11 for local dev** (`docker compose`): cPanel hosts usually ship MariaDB;
  the schema is simple and works identically on MySQL 8, and Drizzle/mysql2 drive both.
- **`serverExternalPackages` + `outputFileTracingIncludes` for the release.** Next.js
  inlines dependencies into its server chunks, so `mysql2`/`drizzle-orm`/`zod` were
  missing from the standalone `node_modules` — and the whole `drizzle-orm` package is
  included because `migrate.mjs` needs the `mysql2/migrator` subpath the app never imports.
- **Bundled server scripts with `--packages=external`.** `migrate.mjs` and
  `create-admin.mjs` are esbuild bundles that resolve packages from the release's
  `node_modules` — one code path locally (`tsx`) and on the server.
- **Host routing as pure functions** (`web/src/lib/host.ts`, unit-tested) consumed by
  the middleware: admin paths only on the admin host; `/pay/*`, `/api/pv`, `/pv.js` on
  the app host and — because this server can't attach a second domain — also on the
  admin host (the fallback); `/healthz` on every known host; unknown hosts get 404;
  `ADMIN_IP_ALLOWLIST` never blocks public paths. CSP nonce only in production (dev
  needs `eval`).
- **Rate limiting in the database** (`login_attempts` table), not in memory — correct
  across Passenger restarts, and lockouts land in the activity log.
- **Tailwind CSS v4** for the admin panel (the brief's stack; CSS-first config).
- **Mac-side tooling lives in a root `package.json`** (html-validate, Playwright, axe,
  sharp, node-html-parser). It's dev-only and never deployed — the server only receives
  `sites/` files and the built app. Playwright browsers install via
  `npx playwright install chromium` on the Mac.
- **`outputFileTracingRoot` pinned to `web/`.** Once the repo root got its own lockfile
  (for the tooling), Next.js inferred a monorepo layout and nested the standalone output;
  pinning keeps the release layout deterministic (`standalone/server.js`).
- **Generated files are excluded from ESLint** (`next-env.d.ts`) — `next typegen`
  regenerates it, and its triple-slash reference is intentional.
- **`tel-non-breaking` rule disabled in `check-site.mjs`.** It mistook the
  `[[NEEDS INFO: phone]]` placeholders for real phone numbers; non-breaking spaces are
  used when real numbers are filled in.
- **Automatic client subdomains via `uapi`** in `update.sh` (host confirmed it works):
  `SubDomain::listsubdomains` to check, `SubDomain::addsubdomain` to create with the
  site's folder as document root, `SSL::start_autossl_check` after creations. Manual
  click-steps printed as the fallback.
- **`node-linker=hoisted` in `web/.npmrc` (flat node_modules).** pnpm's default
  symlinked layout broke inside the standalone release on its way through git to the
  server — Next.js then failed to boot with `Cannot find module 'styled-jsx/package.json'`
  (HTTP 500 via Passenger). Reproduced locally, fixed by shipping a flat, npm-style
  node_modules with real folders only; verified with a local dress rehearsal.
- **`PUBLIC_APP_HOST=admin.pykk.uk` (the single-host fallback) on this server.** The
  host's "Setup Node.js App" allows only one URL per app, so `app.pykk.uk` can't be
  attached. Per the brief's planned fallback, the pay pages, beacon and public API will
  be served on the admin host, and `ADMIN_IP_ALLOWLIST` must never block them.
- **The repo's `index.html` is the source of truth for the live homepage.** The founder
  asked for the homepage to deploy from the repo like everything else. `update.sh` copies
  it to `~/pykk.uk` on each run, saving the previous live file as `index.html.bak` first.
  The "never modify `index.html`" rule still stands for the *content* — changes are made
  deliberately in the repo, never by editing the live file on the server.
- **The `deploy` branch keeps its history** (one commit per deploy, published with
  peaceiris/actions-gh-pages) instead of being wiped each time — so the server can roll
  back with `git reset --hard <previous hash>` as described in DEPLOY.md.
- **`start.js` uses Node's built-in `.env` parser** (`process.loadEnvFile`, Node 22)
  instead of bundling dotenv — one less dependency in the minimal standalone release.
- **The app version comes from `VERSION.txt` at boot.** `start.js` reads it into
  `APP_VERSION`; `/healthz` and the home page report it. No build-time code generation.
- **Vitest for tests, ESLint flat config for linting, `next typegen` before `tsc`** —
  so lint/typecheck/test run fast in CI without needing a full build first.
- **Next.js (App Router, TypeScript) with `output: 'standalone'`** — the build produces
  a self-contained `server.js` + minimal `node_modules`, which is what the memory-limited
  cPanel server can run without building anything.
- **`pykk` is its own git repo.** It previously sat inside a git repo covering the
  whole home folder (leftover from other projects). `git init` inside `pykk/` gives
  it an independent history; the outer repo was not touched. Nothing inside `pykk`
  was tracked by it, so nothing was lost.
- **SSH remote on the Mac, HTTPS on the server.** The GitHub CLI token on the Mac is
  expired but the SSH key works, so `origin` is `git@github.com:...`. The repo is
  public, so cPanel can still pull over plain HTTPS with no keys or passwords.
- **`.env*` ignored, `.env.example` tracked.** Secrets never enter the public repo;
  example files with empty values do, so the server setup knows exactly what to fill in.
- **Node 22 LTS for builds and the server, any modern Node locally.** The Mac has
  Node 25 — fine for the small local scripts. The GitHub Action and cPanel use 22 LTS.
- **Never build on the server.** Shared hosting has limited memory, so GitHub Actions
  builds the app and publishes a ready-to-run `deploy` branch; the server only pulls it.
