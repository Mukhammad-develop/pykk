# DECISIONS

Short reasons for technical choices, newest first.

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
