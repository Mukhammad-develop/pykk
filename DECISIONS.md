# DECISIONS

Short reasons for technical choices, newest first.

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
