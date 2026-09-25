# DECISIONS

Short reasons for technical choices, newest first.

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
