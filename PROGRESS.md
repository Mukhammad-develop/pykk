# PROGRESS

## Done

- **P0 — Setup** (25 Sep 2026): `pykk` is now its own git repository, connected to
  GitHub (`Mukhammad-develop/pykk`). Folder layout created (`web/`, `sites/_templates/`,
  `scripts/`, `.github/workflows/`). `.gitignore`, `PROGRESS.md` and `DECISIONS.md`
  in place. `index.html` untouched.

## Next

- **P1 — Prove the hosting works:** minimal Next.js app in `web/` with a
  "PYKK is running" page and `/healthz`; GitHub Action that builds and publishes
  the `deploy` branch; `start.js` and `scripts/update.sh`; `docs/DEPLOY.md`;
  first-time cPanel setup until `https://admin.pykk.uk/healthz` answers with a padlock.

## Waiting on the founder

- `docs/ADMIN_BRIEF.md` (the admin panel spec) — needed before phase P3.
- To confirm with the hosting company: which Node.js versions are offered,
  MySQL or MariaDB, whether one Node app can serve two domains
  (`admin.pykk.uk` + `app.pykk.uk`), and whether the `uapi` command works in
  cPanel Terminal.
