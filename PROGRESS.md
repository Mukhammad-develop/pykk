# PROGRESS

## Done

- **P0 — Setup** (25 Sep 2026): `pykk` is now its own git repository, connected to
  GitHub (`Mukhammad-develop/pykk`). Folder layout created (`web/`, `sites/_templates/`,
  `scripts/`, `.github/workflows/`). `.gitignore`, `PROGRESS.md` and `DECISIONS.md`
  in place. `index.html` untouched.

- **P1 — Prove the hosting works (code done, server part remains):** minimal Next.js
  app in `web/` with a "PYKK is running" page and `/healthz`; GitHub Action that builds
  and publishes the `deploy` branch; `start.js` and `scripts/update.sh`;
  `web/.env.example`; `docs/DEPLOY.md`. Verified locally: lint, typecheck, tests and a
  full standalone build all pass.

## Next

- **Finish P1 on the server:** follow `docs/DEPLOY.md` (Part 1) until
  `https://admin.pykk.uk/healthz` answers with a padlock. Do not start P2 before that.
- **P2 — Client site workflow:** 4 templates, `new-site.mjs`, `check-site.mjs`,
  subdomain creation in `update.sh`, `NEW_CLIENT.md`, demo site live.

## Waiting on the founder

- `docs/ADMIN_BRIEF.md` (the admin panel spec) — needed before phase P3.
- To confirm with the hosting company: which Node.js versions are offered,
  MySQL or MariaDB, whether one Node app can serve two domains
  (`admin.pykk.uk` + `app.pykk.uk`), and whether the `uapi` command works in
  cPanel Terminal.
