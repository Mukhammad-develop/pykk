# AGENTS.md — PYKK project memory for every chat

Read this file first, whatever the task is. It tells you what PYKK is, the rules you
must never break, and how the pieces fit together.

- **Making a website for a client?** Follow `docs/NEW_CLIENT.md` (the step-by-step
  checklist). The short version is below.
- **Current state of the project:** `PROGRESS.md` (what's done, what's next).
- **Why things are the way they are:** `DECISIONS.md`.
- **The original master brief:** `docs/KIMI_START.md` (wins if documents disagree).
- **Server/deploy details:** `docs/DEPLOY.md`.

## What PYKK is

"Tech for every business." Simple, fast, static websites for small UK local
businesses (barbers, beauty salons, cafés, cleaners), each living at
`https://{slug}.pykk.uk`, plus a Next.js app at `admin.pykk.uk` (admin panel,
client pay pages, API — built in phases). Hosting is cPanel shared hosting.

## Golden rules — never break these

1. **Never commit secrets.** The repo is PUBLIC. No `.env` files, passwords, keys,
   customer data or database dumps. Scan staged changes before every commit.
2. **Never edit the root `index.html` unless the founder explicitly asks.** It is the
   live pykk.uk homepage. The repo is its source of truth: every `update.sh` run
   copies it to the server (keeping the previous live file as `index.html.bak`).
3. **Never invent facts for client sites.** No fake prices, reviews, awards,
   ratings or statistics. Anything unknown becomes a visible `[[NEEDS INFO: …]]`
   placeholder. UK English everywhere.
4. **Client sites stay simple:** static HTML + one CSS file + tiny vanilla JS only.
   No frameworks, no CDNs, no webfonts. Mobile-first, WCAG AA contrast, no
   horizontal scroll at 360 px.
5. **Never build on the server** and never push to the `deploy` branch by hand —
   GitHub Actions builds it. Don't run git mutations (commit/push/reset) without
   telling the founder what you're committing first.
6. **No Next.js server actions.** Mutations are `fetch()` POSTs with JSON bodies to
   route handlers — server-action posts 404 on this server's Node 22 (proven;
   see `DECISIONS.md`). Route handlers must check the origin (`lib/request.ts`).
6. **Keep `PROGRESS.md` and `DECISIONS.md` current** when you change something
   meaningful.

## How the pieces fit

- **Repo** `github.com/Mukhammad-develop/pykk` (public). `main` = source code,
  client sites, scripts. `deploy` = ready-to-run app, built by GitHub Actions.
- **`web/`** — the Next.js app. Served at `admin.pykk.uk`. The host allows only ONE
  URL per Node app, so the fallback is active: `PUBLIC_APP_HOST=admin.pykk.uk`, and
  `/pay/*`, `/api/pv`, `/pv.js`, `/healthz` all live on the admin host. An IP
  allowlist (later) must never block those paths.
- **`sites/_templates/`** — 4 starter templates: `barber`, `beauty`, `cafe`,
  `services`. **`sites/{slug}/`** — one folder per client site (static), served at
  `{slug}.pykk.uk` (cPanel subdomain, document root `pykk/sites/{slug}`).
- **Templates use tokens** `{{SITE_NAME}}`, `{{SITE_SLUG}}`, `{{PUBLIC_APP_HOST}}`,
  filled by `new-site.mjs`. Every template already includes the page-view beacon
  (`/pv.js` on the app host) and a "Website by PYKK" footer link — keep both.
- **Preview vs published:** a `<meta name="robots" content="noindex">` tag means
  preview mode (hidden from Google). `--publish` removes it after the client pays.
- **Mac-only tooling** lives in the root `package.json` (html-validate, Playwright,
  axe, sharp). It is never deployed. One-time setup: `pnpm install` then
  `npx playwright install chromium`.
- **On the server:** `~/pykk` (main branch: sites + scripts), `~/pykk-web` (deploy
  branch: the running app + the only `.env`), `~/pykk.uk` (homepage document root),
  MySQL `bmbrenov_pykk`, Node 22.
- **`scripts/update.sh` is THE server routine** (run in cPanel Terminal after every
  push): pulls both repos → syncs the homepage → updates the app → runs migrations
  (from P3) → restarts the app → creates any missing client subdomains via `uapi`
  and starts AutoSSL → health check. Safe to run repeatedly; retries git operations
  because this host sometimes refuses to fork under resource pressure.

## Making a client website (short version — full checklist in docs/NEW_CLIENT.md)

1. `node scripts/new-site.mjs --slug SLUG --name "BUSINESS NAME" --type barber|beauty|cafe|services`
   (slug: 3–40 chars, a–z 0–9 hyphens; reserved: www, admin, app, api, mail,
   webmail, cpanel, ftp, pay, status, pykk)
2. Customise from the founder's notes: replace every `[[NEEDS INFO: …]]` with real
   facts; put client photos in `sites/SLUG/images/` and wire them into the gallery
   (keep them under ~300 KB; `check-site.mjs SLUG --webp` converts heavy ones).
3. `node scripts/check-site.mjs SLUG` — fix every ❌ before pushing.
4. `git add sites/SLUG && git commit -m "Add site: NAME" && git push`
5. Founder runs `bash ~/pykk/scripts/update.sh` in cPanel Terminal → the subdomain
   and its SSL padlock are created automatically.
6. After the client has paid: `node scripts/new-site.mjs --slug SLUG --publish`,
   commit, push, and the founder runs `update.sh` again.

## Host facts we confirmed (don't re-ask)

Node 22 available; only one URL per Node.js app (fallback active); `uapi` works in
cPanel Terminal (subdomains are automatic); MySQL vs MariaDB still unconfirmed.
The account runs several Node apps, so the host occasionally refuses to fork new
processes for a minute or two — retry rather than assuming something is broken.

## When unsure

Ask the founder **one** question rather than inventing a feature or a fact.
