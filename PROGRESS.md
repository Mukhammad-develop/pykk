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
  is proven on Node 22 in Docker with a real browser.

## Next

- **Finish P3 Phase 1 on the server:** push → Action green → `update.sh` (runs the
  first migrations) → `node create-admin.mjs` on cPanel → log in on the iPhone.
- **P3 Phase 2 — Businesses and payments:** schema + migrations, due-date logic
  (Europe/London) with tests, 6-char references, the daily job + cron endpoint,
  idempotency tests.
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
