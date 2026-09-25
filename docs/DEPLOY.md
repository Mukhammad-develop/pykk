# Deploying PYKK to cPanel

This guide takes you from zero to a running app at **https://admin.pykk.uk** — click by click.
Do **Part 1** once. After that, **Part 2** is the routine for every update.

How it all fits together:

- **GitHub `main` branch** — the source code, the client sites and the scripts.
- **GitHub `deploy` branch** — the ready-to-run app, built by GitHub Actions. Never edit it by hand.
- On the server there are two folders:
  - `~/pykk` — a clone of **main** (client sites + scripts)
  - `~/pykk-web` — a clone of **deploy** (the running app; cPanel's "Node.js App" points here)
- `~/pykk.uk` is your live homepage's document root. The repo's `index.html` is its
  source of truth: every run of `update.sh` copies the repo version there (keeping the
  previous live file as `index.html.bak`). Never edit the live file by hand — edit it in
  the repo on your Mac and push.
- The server **never builds anything** — it only pulls finished files. Secrets live only in
  `~/pykk-web/.env` on the server (never in git).

---

## Part 1 — First-time setup (do this once)

### 1. Open cPanel Terminal

In cPanel, scroll to **Advanced → Terminal** (or type "Terminal" in the cPanel search box).
If it's not there, ask your host to enable it, or use SSH instead.

### 2. Clone the two folders

Paste these two lines, one at a time:

```
git clone https://github.com/Mukhammad-develop/pykk.git ~/pykk
git clone -b deploy https://github.com/Mukhammad-develop/pykk.git ~/pykk-web
```

The repo is public, so no keys or passwords are needed.

> If the second command says the `deploy` branch doesn't exist: the GitHub Action hasn't run
> yet. On GitHub go to the repo → **Actions → Deploy → Run workflow**, wait for it to go
> green, then repeat the second command.

### 3. Create the database

In cPanel → **MySQL® Databases** (sometimes called *Manage My Databases*):

1. **Create New Database** — e.g. `pykk`. cPanel adds a prefix, so the real name will be
   something like `cpaneluser_pykk`. Write down the full name.
2. **Add New User** — e.g. `pykk`, with a strong password (use the built-in generator).
   Write down the full username (also prefixed) and the password.
3. **Add User To Database** — pick the user and the database, tick **All Privileges**,
   click **Make Changes**.

### 4. Create the domains

In cPanel → **Domains → Create A New Domain**:

- Domain: `admin.pykk.uk` — **untick "Share document root"** — accept the suggested
  document root — **Submit**.
- Do the same for `app.pykk.uk`.

> **Two domains, one app:** some hosts let one Node.js app answer on two domains. Try it
> later in step 5 — if your host allows only one URL, that's fine: in step 6 you'll set
> `PUBLIC_APP_HOST=admin.pykk.uk` and everything will work through the admin host.

### 5. Create the Node.js application

In cPanel → **Setup Node.js App → Create Application**:

- **Node.js version:** 22.x — or the closest available (tell Kimi what choices you see)
- **Application mode:** **Production**
- **Application root:** `pykk-web`
- **Application URL:** `admin.pykk.uk`
- **Application startup file:** `start.js`

Click **Create**.

Afterwards the app's page shows a command starting with `source /home/.../nodevenv/...` —
that's the **"enter virtual environment"** command. Copy it somewhere safe (you shouldn't
need it — `update.sh` finds it automatically).

> Do **not** click "Run NPM Install" — the app arrives ready-built from GitHub.

**Try attaching the second domain:** if the app's edit screen lets you add another URL or
domain, add `app.pykk.uk`. If there's no such option, no problem — see the note in step 4
and set the fallback in step 6.

### 6. Create the `.env` file (the secrets — only on the server)

In cPanel → **File Manager**: click **Settings** (top right) → tick
**"Show Hidden Files (dotfiles)"** → **Save**. Open the `pykk-web` folder → **+ File** →
name it exactly `.env` → edit it and paste this, filling in your values:

```
ROOT_DOMAIN=pykk.uk
PUBLIC_APP_HOST=app.pykk.uk
DATABASE_URL=mysql://cpaneluser_pykk:PASSWORD@localhost:3306/cpaneluser_pykk
SESSION_SECRET=
CRON_SECRET=
DEFAULT_PRICE_PENCE=499
ADMIN_IP_ALLOWLIST=
SITES_DIR=/home/cpaneluser/pykk/sites
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
STRIPE_WEBHOOK_SECRET=
```

What each line means:

| Variable | What to put |
|---|---|
| `ROOT_DOMAIN` | Leave as `pykk.uk`. |
| `PUBLIC_APP_HOST` | `app.pykk.uk` — or `admin.pykk.uk` if you couldn't attach the second domain in step 5. |
| `DATABASE_URL` | Replace `cpaneluser_pykk` (twice) with your full database/user names and `PASSWORD` with the database password from step 3. |
| `SESSION_SECRET` | In cPanel Terminal run `openssl rand -hex 32` and paste the result. |
| `CRON_SECRET` | Run `openssl rand -hex 32` **again** (a different value) and paste it. |
| `DEFAULT_PRICE_PENCE` | Default monthly price in pence: `499` = £4.99. |
| `ADMIN_IP_ALLOWLIST` | Leave empty for now (allows everyone). Later you can restrict the admin panel to your own IP. Never blocks `/pay/*`, `/api/pv` or `/healthz`. |
| `SITES_DIR` | Replace `cpaneluser` with your cPanel username. |
| `TELEGRAM_*` | Leave empty — notifications come later. |
| `STRIPE_WEBHOOK_SECRET` | Leave empty — card payments come later. |

### 7. First run

In cPanel Terminal:

```
bash ~/pykk/scripts/update.sh
```

You should see coloured steps ending with a health check that prints a line of JSON like
`{"ok":true,"service":"pykk","version":"abc1234",...}`.

> The command `node ~/pykk-web/create-admin.mjs` (creating your admin login) arrives with
> the admin panel phase — skip it for now.

### 8. Get the padlock (SSL)

cPanel → **SSL/TLS Status** → tick `admin.pykk.uk` and `app.pykk.uk` → **Run AutoSSL**.
Give it a few minutes, then open **https://admin.pykk.uk** — you should see a padlock and
"PYKK is running".

### 9. Daily cron job — skip for now

This only works once the admin panel phase is live. When it is: cPanel → **Cron Jobs →
Add New Cron Job**, set it to run **Once a day at 06:00** (`0 6 * * *`), command:

```
curl -fsS -H "Authorization: Bearer PASTE_YOUR_CRON_SECRET" https://admin.pykk.uk/api/cron/daily >/dev/null 2>&1
```

(Replace `PASTE_YOUR_CRON_SECRET` with the `CRON_SECRET` value from your `.env`.)

### 10. If something goes wrong

- **The site shows an error page:** watch the app start by hand to see the real error.
  In cPanel Terminal:
  ```
  source ~/nodevenv/pykk-web/*/bin/activate && cd ~/pykk-web && node start.js
  ```
  Read the error, fix it (usually a `.env` typo), press **Ctrl+C**, then
  `touch ~/pykk-web/tmp/restart.txt` to hand the app back to cPanel.
- **Restart the app:** cPanel → Setup Node.js App → **Restart** — or run
  `touch ~/pykk-web/tmp/restart.txt` in Terminal.
- **Roll back to the previous version:**
  ```
  cd ~/pykk-web
  git log --oneline
  git reset --hard PASTE_THE_PREVIOUS_HASH
  mkdir -p tmp && touch tmp/restart.txt
  ```
  Pick the hash of the `Deploy ...` commit from **before** the broken one.
- **Still stuck?** Note the exact error message and tell Kimi.

---

## Part 2 — Every update (the normal routine)

1. **On your Mac:** push to GitHub (Kimi usually does this for you).
2. **Wait for the GitHub Action to go green:** open the repo → **Actions**. A push that
   changes `web/` builds and publishes the new release (about 2–4 minutes).
3. **In cPanel Terminal:** `bash ~/pykk/scripts/update.sh`
   — this also syncs the live homepage from the repo's `index.html` if it changed
   (the old live file is kept as `~/pykk.uk/index.html.bak`).
4. **Check:** https://admin.pykk.uk/healthz shows the new version (the first 7 characters
   of the commit hash).

> A push that only changes `sites/` or `docs/` doesn't rebuild the app — steps 2 and 4
> don't apply, but still run `update.sh` so the server pulls the new site files.

---

## Things to confirm with your host (tell Kimi the answers)

- Which **Node.js versions** the "Setup Node.js App" screen offers (we want 22).
- Whether the database is **MySQL or MariaDB** (either works).
- Whether **one Node app can serve two domains** (admin.pykk.uk + app.pykk.uk) — if not,
  we use the `PUBLIC_APP_HOST=admin.pykk.uk` fallback from step 6.
- Whether the **`uapi` command** works in cPanel Terminal — needed for automatic client
  subdomains in the next phase. Try it: `uapi --help`.
