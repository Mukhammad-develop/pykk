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

## Next

- **P2 — Client site workflow:** 4 templates, `new-site.mjs`, `check-site.mjs`,
  subdomain creation in `update.sh`, `NEW_CLIENT.md`, demo site live.

## Waiting on the founder

- `docs/ADMIN_BRIEF.md` (the admin panel spec) — needed before phase P3.
- Answered by the host so far: **Node 22 is available** (used for the app); **one Node
  app cannot serve two domains**, so the fallback is active — `PUBLIC_APP_HOST=admin.pykk.uk`,
  and `/pay/*`, `/api/pv`, `/healthz` will live on the admin host.
- Still to confirm: MySQL or MariaDB, and whether the `uapi` command works in cPanel
  Terminal (needed for automatic client subdomains in P2).
