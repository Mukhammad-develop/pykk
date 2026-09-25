#!/usr/bin/env bash
#
# PYKK updater — safe to run any number of times.
# Run it in cPanel Terminal after every push:
#
#   bash ~/pykk/scripts/update.sh
#
set -euo pipefail

# --- Settings --------------------------------------------------------------
# Path to the cPanel Node virtual environment "activate" script.
# Leave empty to auto-detect ~/nodevenv/pykk-web/*/bin/activate
NODEVENV=""

SITES_REPO="$HOME/pykk"   # clone of the main branch (client sites + scripts)
APP_DIR="$HOME/pykk-web"  # clone of the deploy branch (the running app)
APP_URL="https://admin.pykk.uk"
HOMEPAGE_DIR="$HOME/pykk.uk"  # document root of the live homepage
# ---------------------------------------------------------------------------

if [ -t 1 ]; then
  B=$'\033[1;34m'; G=$'\033[1;32m'; Y=$'\033[1;33m'; N=$'\033[0m'
else
  B=""; G=""; Y=""; N=""
fi
step() { printf '%s==>%s %s\n' "$B" "$N" "$1"; }
ok()   { printf '%s ✔%s %s\n' "$G" "$N" "$1"; }
warn() { printf '%s !%s %s\n' "$Y" "$N" "$1"; }

step "Updating the sites repo ($SITES_REPO)"
cd "$SITES_REPO"
git pull --ff-only
ok "Sites repo up to date"

step "Updating the homepage (pykk.uk)"
# The repo's index.html is the source of truth for the live homepage.
# If the live file differs, the old one is kept as index.html.bak first.
if [ -d "$HOMEPAGE_DIR" ]; then
  if ! cmp -s "$SITES_REPO/index.html" "$HOMEPAGE_DIR/index.html" 2>/dev/null; then
    if [ -f "$HOMEPAGE_DIR/index.html" ]; then
      cp "$HOMEPAGE_DIR/index.html" "$HOMEPAGE_DIR/index.html.bak"
    fi
    cp "$SITES_REPO/index.html" "$HOMEPAGE_DIR/index.html"
    ok "Homepage updated (previous live copy saved as index.html.bak)"
  else
    ok "Homepage already up to date"
  fi
else
  warn "$HOMEPAGE_DIR not found — homepage not updated"
fi

step "Updating the app ($APP_DIR)"
cd "$APP_DIR"
git fetch origin deploy
git reset --hard origin/deploy
ok "App updated to commit $(git rev-parse --short HEAD)"

step "Activating the Node environment"
if [ -z "$NODEVENV" ]; then
  NODEVENV="$(ls "$HOME"/nodevenv/pykk-web/*/bin/activate 2>/dev/null | head -n 1 || true)"
fi
if [ -n "$NODEVENV" ] && [ -f "$NODEVENV" ]; then
  # shellcheck disable=SC1090
  . "$NODEVENV"
  ok "Using $(node --version)"
else
  warn "Node virtualenv not found — using the system node ($(node --version 2>/dev/null || echo 'not found'))"
fi

step "Running database migrations"
if [ -f "$APP_DIR/migrate.mjs" ]; then
  (cd "$APP_DIR" && node migrate.mjs)
  ok "Migrations done"
else
  echo "  No migrate.mjs yet — skipping (it arrives with the admin panel phase)"
fi

step "Restarting the app"
cd "$APP_DIR"
mkdir -p tmp
touch tmp/restart.txt
ok "restart.txt touched"
if command -v cloudlinux-selector >/dev/null 2>&1; then
  if cloudlinux-selector restart >/dev/null 2>&1; then
    ok "cloudlinux-selector restart sent"
  else
    warn "cloudlinux-selector restart failed — the restart.txt touch above is usually enough"
  fi
fi

step "Health check"
sleep 3
if curl -fsS --max-time 15 "$APP_URL/healthz"; then
  printf '\n'
  ok "App is answering at $APP_URL"
else
  warn "Health check failed — see 'If something goes wrong' in docs/DEPLOY.md"
fi

echo
ok "Update complete"
