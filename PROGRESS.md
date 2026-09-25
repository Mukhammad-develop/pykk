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

- **P2 — Client site workflow (code done, demo goes live on next update.sh run):**
  4 starter templates in `sites/_templates/` (`barber`, `beauty`, `cafe`, `services`) —
  mobile-first, accessible, clearly different designs, `[[NEEDS INFO: …]]` placeholders
  for every unknown fact. `scripts/new-site.mjs` (create from template / `--publish`),
  `scripts/check-site.mjs` (HTML validity, links, image weight + `--webp`, placeholders,
  phone-width layout, axe accessibility — all passing on the `demo` site).
  `update.sh` now creates missing client subdomains automatically via `uapi` and starts
  AutoSSL (host confirmed: `uapi` works). `/pv.js` placeholder route added so the beacon
  tag never 404s. `docs/NEW_CLIENT.md` written. Mac-side tooling lives in a root
  `package.json` (never deployed).

## Next

- **Finish P2 on the server:** after this push, run `bash ~/pykk/scripts/update.sh` in
  cPanel Terminal → `demo.pykk.uk` is created automatically → check
  https://demo.pykk.uk on a phone (padlock may take a few minutes).
- **P3 onwards — the admin panel:** phases 1–7 from `docs/ADMIN_BRIEF.md`, one at a time.
- **Last:** a final review of `DEPLOY.md`, `NEW_CLIENT.md` and `PROGRESS.md` so someone
  new could follow them.

## Waiting on the founder

- `docs/ADMIN_BRIEF.md` (the admin panel spec) — needed before phase P3.
- Answered by the host so far: **Node 22 is available** (used for the app); **one Node
  app cannot serve two domains**, so the fallback is active — `PUBLIC_APP_HOST=admin.pykk.uk`,
  and `/pay/*`, `/api/pv`, `/healthz` will live on the admin host; **`uapi` works** in
  cPanel Terminal, so client subdomains are created automatically by `update.sh`.
- Still to confirm: MySQL or MariaDB (needed for the database work in P3).
