# KIMI START HERE: PYKK setup brief

You are my developer. I'm the founder of PYKK and I'm **not** a professional developer. I run you in my Mac's Terminal inside my project folder `pykk`.

Read this whole file first, then `docs/ADMIN_BRIEF.md` (the detailed admin panel spec). This file wins if the two disagree.

---

## 0. Rules for working with me

1. **Explain simply.** Short answers, no jargon without a one-line explanation.
2. **Work in phases** (section 8). For each phase:
   1. Show me a short plan and **wait for me to type "go"**.
   2. Build it and run the tests.
   3. **Commit and push to GitHub.**
   4. Tell me what you did, in plain English.
3. Every time I need to do something myself, give me exact steps in two clearly labelled blocks:
   - **ON YOUR MAC:** Terminal commands, one per line, ready to copy (macOS, zsh).
   - **ON CPANEL:** the exact clicks, or the commands to paste into cPanel → **Terminal**.
4. **Never commit secrets.** `.env` files, passwords and keys stay out of git. If you see one staged, stop and warn me.
5. **Never modify the root `index.html`.** It is my live pykk.uk homepage and it stays as it is.
6. Never invent data or features I didn't ask for. If something is unclear, ask me one question.
7. Keep `PROGRESS.md` (what's done, what's next) and `DECISIONS.md` (short reasons for technical choices) up to date.

---

## 1. The repository

- My local folder `pykk` (where you are now) should be connected to **https://github.com/Mukhammad-develop/pykk.git**. Right now it contains `index.html`.
- **First, check:**
  - Is this a git repository? Run `git status` and `git remote -v`.
  - What is the default branch (`main` or `master`)? Use whatever exists.
  - Is `origin` set to the URL above? If not, add it. Then pull first so nothing on GitHub is overwritten.
  - Check which tools are installed on my Mac: `git`, `node` (I need **22 LTS**), `pnpm` (enable it with `corepack enable` if it's missing), `docker`, `brew`. For anything missing, give me the exact install steps.
  - If `git push` fails because of login, guide me through the **GitHub CLI** (`brew install gh`, then `gh auth login`).
- **The repo is public, and it stays public.** cPanel can pull from it over HTTPS with no keys or passwords. Because anyone can read it:
  - Double-check every commit for secrets: `.env` files, passwords, API keys, customer data and database dumps.
  - Keep secrets only in `~/pykk-web/.env` on the server and in a local `.env` on my Mac, both ignored by git.
  - Never put real customer details (names, phone numbers, emails) in test data or example files.

---

## 2. Hosting facts (please design for these)

- **Hosting:** my cPanel at Unlimited Web Hosting. The nameservers for pykk.uk already point to it, so cPanel controls the DNS.
- **pykk.uk and www.pykk.uk** stay exactly as they are (served from cPanel `public_html`). Don't touch them.
- **The Next.js app** (admin panel, client pay pages and API) runs through cPanel **"Setup Node.js App"** (CloudLinux / Passenger).
  - Shared hosting has **limited memory**, so **never build on the server**. GitHub Actions builds, and the server only pulls ready-to-run files (section 4).
  - The Node app is attached to **admin.pykk.uk** (and **app.pykk.uk** if the host allows two domains per app; see 4.5).
- **Database:** **MySQL / MariaDB** from cPanel. Use Drizzle ORM with the `mysql2` driver.
  - For local development on my Mac, run MySQL in Docker if I have Docker; otherwise guide me to install it with Homebrew.
- **Client websites are static files.** Each client has a folder `sites/{slug}/` (HTML, CSS, images). Apache serves it through its own cPanel subdomain, `{slug}.pykk.uk`, whose document root points at that folder. AutoSSL gives each subdomain its padlock.
  - Dynamic features (the page-view beacon now; booking forms later) call the Next.js API at `https://app.pykk.uk/api/...` (or the fallback host, see 4.5).
- **SSL:** cPanel AutoSSL issues a certificate per subdomain. There is **no** wildcard certificate.
- **Scheduled jobs:** a **cPanel Cron Job** calls the app's daily endpoint with `curl`.

**I still need to confirm with my host:** the Node.js versions, whether it's MySQL or MariaDB, whether two domains can share one Node app, and whether the `uapi` command works in cPanel Terminal. Make the code flexible (env settings and fallbacks) so any answer works. Tell me when a decision depends on one of these.

---

## 3. Repository layout (create this)

```
pykk/
  index.html                 ← live pykk.uk homepage (DO NOT MODIFY)
  docs/
    KIMI_START.md            ← this file
    ADMIN_BRIEF.md           ← admin panel spec
    DEPLOY.md                ← first-time cPanel setup + every update (you write it)
    NEW_CLIENT.md            ← checklist for adding a client website (you write it)
  web/                       ← Next.js app (admin.pykk.uk + app.pykk.uk + API)
  sites/
    _templates/              ← starter templates for client sites
    {slug}/                  ← one folder per client website (static)
  scripts/
    new-site.mjs             ← create a new client site from a template (run on the Mac)
    check-site.mjs           ← check a client site before pushing (run on the Mac)
    update.sh                ← run on cPanel after every push
  .github/workflows/
    deploy.yml               ← builds web/ and publishes the ready-to-run app to the "deploy" branch
  PROGRESS.md
  DECISIONS.md
  .gitignore                 ← node_modules, .next, .env*, release/, tmp/, .DS_Store
```

---

## 4. Deployment pipeline (push → pull → running)

### 4.1 Branches

- **`main`** (or `master`) holds the source code, the client sites and the scripts. I push here.
- **`deploy`** holds only the **ready-to-run** app, built by GitHub Actions. Never edit it by hand.

### 4.2 GitHub Actions (`deploy.yml`)

Trigger it on every push to the default branch that changes `web/**`, plus a manual "Run workflow" button. Steps:

1. Set up Node (the version comes from a repo variable; default 22) and pnpm. Install, lint, typecheck, test.
2. Build Next.js with `output: 'standalone'`.
3. Assemble `release/` containing:
   - the standalone `server.js` and its `node_modules`
   - `.next/static` and `public`, copied into the right places inside the standalone folder
   - **`start.js`**: loads `.env` from the app folder (with `dotenv`, if the file exists), then starts the standalone server. Passenger provides the port.
   - **`migrate.mjs`**: a single bundled file (esbuild) that runs the Drizzle migrations, plus the `drizzle/` migrations folder
   - **`create-admin.mjs`**: a bundled script to create my admin user from the cPanel Terminal. It asks for the email and password interactively.
   - `.gitignore` inside the release listing `.env` and `tmp/`, so the server's `.env` is never touched
   - `VERSION.txt` with the commit hash and build time
4. Force-push `release/` as the only content of the **`deploy`** branch (with a single commit, or a clean history).
5. Give the workflow the `contents: write` permission.

### 4.3 On the server (two folders)

- `~/pykk` is a clone of the **main** branch. It holds the client sites (`sites/`) and the scripts.
- `~/pykk-web` is a clone of the **deploy** branch. This is the **Node app root** in "Setup Node.js App".
- `~/pykk-web/.env` exists **only on the server**. I create it once, and you give me the exact contents to fill in, based on `.env.example`.

### 4.4 `scripts/update.sh` (I run this in cPanel Terminal after every push)

Command: `bash ~/pykk/scripts/update.sh`. It must be **safe to run any number of times**, stop on errors, and print friendly coloured steps. It should:

1. Update the sites: `cd ~/pykk && git pull --ff-only`.
2. Update the app: `cd ~/pykk-web && git fetch origin deploy && git reset --hard origin/deploy`. The ignored `.env` survives this.
3. Activate the Node environment that cPanel created.
   - Auto-detect `~/nodevenv/pykk-web/*/bin/activate`, or read the path from a `NODEVENV` setting at the top of the script.
   - Then run `node migrate.mjs`.
4. Restart the app: `mkdir -p tmp && touch tmp/restart.txt`. Also use `cloudlinux-selector restart` if that command exists.
5. **Create any missing client subdomains automatically.** For every folder in `~/pykk/sites/` (skip names starting with `_`):
   - Check the slug format.
   - If `{slug}.pykk.uk` doesn't exist yet and the `uapi` command is available, run:
     `uapi SubDomain addsubdomain domain={slug} rootdomain=pykk.uk dir=pykk/sites/{slug}`
     (the directory path is relative to home). Check the command's output to confirm it worked.
   - After creating any, trigger `uapi SSL start_autossl_check`.
   - If `uapi` isn't available, print the manual cPanel steps for each missing subdomain instead: **Domains** → **Create A New Domain** → `{slug}.pykk.uk` → untick "Share document root" → document root `pykk/sites/{slug}` → **Submit**.
6. Health check: `curl https://admin.pykk.uk/healthz`. Print a short summary: app version, sites updated, subdomains created, and anything I must do by hand.

### 4.5 Two domains on one Node app

- In the code, route by host: `admin.<ROOT_DOMAIN>` serves the admin panel; `app.<ROOT_DOMAIN>` serves the client pay pages, the beacon and the public API.
- Add the setting `PUBLIC_APP_HOST` (default `app.pykk.uk`).
  - If my host can't attach a second domain to the same Node app, I set `PUBLIC_APP_HOST=admin.pykk.uk`. The pay pages (`/pay/...`) and public API (`/api/pv`, later `/api/booking`) then also work on the admin host.
  - In that case, `ADMIN_IP_ALLOWLIST` must never block `/pay/*`, `/api/pv` or `/healthz`.
- In `DEPLOY.md`, explain how to try adding `app.pykk.uk` to the same app first, and when to use the fallback.

### 4.6 `docs/DEPLOY.md` (first-time setup, click by click)

Write it for a beginner. It covers:

1. **cPanel → Terminal** (or SSH): how to open it.
2. Clone both folders over HTTPS. The repo is public, so no keys are needed:
   - `git clone https://github.com/Mukhammad-develop/pykk.git ~/pykk`
   - `git clone -b deploy https://github.com/Mukhammad-develop/pykk.git ~/pykk-web`
3. **cPanel → MySQL Databases** (or **Manage My Databases**):
   - create a database and a user with a strong password
   - add the user to the database with **All Privileges**
   - write down the full names; cPanel adds a prefix such as `username_pykk`
4. **cPanel → Domains → Create A New Domain:** `admin.pykk.uk` (and `app.pykk.uk`), each with its own document root. Untick "Share document root".
5. **cPanel → Setup Node.js App → Create Application:**
   - Node version: 22, or the closest available
   - Application mode: **Production**
   - Application root: `pykk-web`
   - Application URL: `admin.pykk.uk`
   - Startup file: `start.js`
   - Then **Create**. Explain where cPanel shows the "enter virtual environment" command.
6. Create `~/pykk-web/.env` with **cPanel → File Manager** (tick "Show hidden files"): every variable, with an explanation of each and how to generate the secrets (`openssl rand -hex 32`).
7. First run: `bash ~/pykk/scripts/update.sh`, then create my admin login with `node ~/pykk-web/create-admin.mjs` (inside the Node virtual environment).
8. **cPanel → SSL/TLS Status → Run AutoSSL**, then check that there's a padlock on admin.pykk.uk.
9. **cPanel → Cron Jobs:** add the daily job (06:00) with the exact `curl` line, including the `CRON_SECRET` header.
10. How to check it worked, and what to do if the app shows an error: where the logs are, how to restart, and how to roll back to the previous deploy with `git reset --hard <previous hash>` in `~/pykk-web`.

**"Every update" section:** push from the Mac, wait for the GitHub Action to go green (**repo → Actions**), then run `bash ~/pykk/scripts/update.sh` in cPanel Terminal.

---

## 5. Client websites (every new client)

### 5.1 Templates

Create **4 starter templates** in `sites/_templates/`:
- `barber` (barber and hair)
- `beauty` (beauty and spa)
- `cafe` (café and restaurant)
- `services` (cleaning and local services)

Rules for the templates:
- Static HTML, one CSS file, and optional tiny vanilla JS. No frameworks. Mobile-first, fast and accessible (WCAG AA contrast).
- **Clearly different designs** (typography, colours, layout), so client sites don't look alike.
- Built-in sections: hero, services and prices, gallery, about, opening hours and location (map link), contact (click-to-call, email, WhatsApp link), and a clear call to action.
- Each page includes:
  - the page-view beacon: `<script src="https://{PUBLIC_APP_HOST}/pv.js" data-site="{slug}" defer></script>`
  - a small "Website by PYKK" footer link to https://pykk.uk
  - `<meta name="robots" content="noindex">` while in **preview** mode
- UK English. **No fake reviews, prices, awards or statistics.** Anything unknown becomes a visible `[[NEEDS INFO: …]]` placeholder.

### 5.2 `scripts/new-site.mjs` (run on the Mac)

Usage: `node scripts/new-site.mjs --slug fadeandco --name "Fade & Co." --type barber`

- It validates the slug: lowercase `a–z`, `0–9` and hyphens, 3–40 characters, not reserved (`www, admin, app, api, mail, webmail, cpanel, ftp, pay, status, pykk`) and not already used.
- It copies the template to `sites/{slug}/` and fills in the name, slug and beacon.
- It starts in preview mode (noindex).
- `--publish` removes the noindex from an existing site.

### 5.3 `scripts/check-site.mjs` (run before every push of a site)

Usage: `node scripts/check-site.mjs fadeandco`

It checks:
- HTML validity
- broken links and images
- that images are compressed (warn above 300 KB; offer to convert to WebP with `sharp`)
- that no `[[NEEDS INFO]]` placeholders remain (a warning in preview, an error when published)
- no horizontal scrolling on phones (Playwright at 360, 390 and 430 px)
- basic accessibility (axe)

It prints a simple pass/fail list. Also add a local preview command: `npx serve sites/fadeandco`.

### 5.4 `docs/NEW_CLIENT.md` (the checklist I follow each time)

1. **Admin panel** (admin.pykk.uk): add the business with the same slug, the price, and the first payment date (marked paid).
2. **Mac:** create the site with `new-site.mjs`.
3. **Mac:** ask Kimi to customise it from my notes and photos. Put the photos in `sites/{slug}/images/`.
4. **Mac:** run `check-site.mjs`, preview it, fix any problems.
5. **Mac:** `git add sites/{slug} && git commit -m "Add site: {name}" && git push`.
6. **cPanel Terminal:** `bash ~/pykk/scripts/update.sh`. This creates the subdomain and SSL.
7. **Check** https://{slug}.pykk.uk on the iPhone. The padlock can take a few minutes to appear after AutoSSL runs.
8. **When the client has paid:** run `node scripts/new-site.mjs --slug {slug} --publish`, then push and run update.sh again.

---

## 6. The admin panel

Build it inside `web/`, following **`docs/ADMIN_BRIEF.md`** (payments 7 days before due with a 6-character reference such as `#JK891P`, the paste-link flow, the client pay page, statistics, costs, activity log and settings).

Extra item for this setup: on each business's page, show whether `sites/{slug}` exists on the server (read the path from the `SITES_DIR` env, default `~/pykk/sites`) and link to `https://{slug}.pykk.uk`.

---

## 7. Environment variables (`web/.env.example`, with a comment on every line)

```
ROOT_DOMAIN=pykk.uk
PUBLIC_APP_HOST=app.pykk.uk
DATABASE_URL=mysql://USER:PASSWORD@localhost:3306/DBNAME
SESSION_SECRET=
CRON_SECRET=
DEFAULT_PRICE_PENCE=499
ADMIN_IP_ALLOWLIST=
SITES_DIR=/home/CPANELUSER/pykk/sites
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
STRIPE_WEBHOOK_SECRET=
```

---

## 8. Phases (plan → my "go" → build → test → commit and push → tell me the steps)

- **P0: Setup.**
  - Check the tools and the git connection, create the folder layout, `.gitignore`, `PROGRESS.md`, `DECISIONS.md`, and move the two brief files into `docs/` if they aren't there yet.
  - Commit and push.
- **P1: Prove the hosting works.**
  - Create a minimal Next.js app in `web/` with a "PYKK is running" page and `/healthz`.
  - Add the GitHub Action, the `deploy` branch, `start.js` and `update.sh`.
  - Write `DEPLOY.md` and guide me through the first-time cPanel setup until **https://admin.pykk.uk/healthz** works with a padlock.
  - Don't continue until this works.
- **P2: Client site workflow.**
  - The 4 templates, `new-site.mjs`, `check-site.mjs`, subdomain creation in `update.sh`, and `NEW_CLIENT.md`.
  - Make a test site `demo` and get **https://demo.pykk.uk** live.
- **P3 onwards:** the admin panel phases 1–7 from `docs/ADMIN_BRIEF.md`, one at a time.
  - After each phase: push, wait for the Action to go green, and I run `update.sh` on cPanel.
- **Last:** a final review of `DEPLOY.md`, `NEW_CLIENT.md` and `PROGRESS.md`, so that someone new could follow them.

**Start now with P0:** tell me in 5 bullets what you found in the folder, then show me the P0 plan and wait for "go".
