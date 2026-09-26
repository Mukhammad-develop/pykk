# CLIENT_SITE_GUIDE.md — how to build a PYKK client website

This is the **definitive playbook** for any AI chat asked to create or customise a
client website for PYKK. Follow it exactly — do not invent your own process,
vocabulary, or design system. Also read `AGENTS.md` (project rules) and use
`docs/NEW_CLIENT.md` (the founder's step-by-step checklist).

---

## 1. Vocabulary — non-negotiable

- The client's monthly payment relationship with PYKK is called a **bond**.
  **Never write "subscription"** — not in client sites, not in admin UI copy, not in
  messages to clients, not in comments intended for humans.
- Correct phrases: "monthly bond", "bond payment", "your bond with PYKK",
  "manage your bond", "pay link", "this month's bill".
- Prices are real facts: never invent them. Anything unknown becomes a visible
  `[[NEEDS INFO: …]]` placeholder.

## 2. What a client website IS

- A **static** site: one HTML page (plus a bond page, section 5), one CSS file,
  optional tiny vanilla JS. **No frameworks, no CDNs, no webfonts, no trackers.**
- Mobile-first, fast, WCAG AA contrast, no horizontal scrolling at 360 px.
- UK English. Friendly, plain, local. No fake reviews, ratings, awards,
  "years of experience", or statistics of any kind.
- Always included (already in the templates — never remove):
  - the page-view beacon `<script src="https://…/pv.js" data-site="{slug}" defer></script>`
  - the "Website by PYKK" footer link to https://pykk.uk
  - `<meta name="robots" content="noindex">` until the site is published
    (publish only after the client's first bond payment).

## 3. The workflow (exact commands)

```bash
node scripts/new-site.mjs --slug SLUG --name "BUSINESS NAME" --type barber|beauty|cafe|services
node scripts/check-site.mjs SLUG          # fix every ❌ it prints
# photos: founder puts them in sites/SLUG/images/ — wire them into the gallery,
# compress anything heavy: node scripts/check-site.mjs SLUG --webp
git add sites/SLUG && git commit -m "Add site: BUSINESS NAME" && git push
# founder then runs: bash ~/pykk/scripts/update.sh   (creates SLUG.pykk.uk + SSL)
# after the client's FIRST bond payment:
node scripts/new-site.mjs --slug SLUG --publish
git add sites/SLUG && git commit -m "Publish site: BUSINESS NAME" && git push
```

## 4. Information to collect from the founder EVERY time

Ask for anything that's missing — do not guess:

- Business name, chosen slug, type (barber / beauty / cafe / services)
- Owner name, phone, WhatsApp number, email
- Address + what's near them (for the map/directions area)
- Opening hours (every day of the week)
- Services and **real prices**
- Photos (founder places them in `sites/SLUG/images/`)
- Anything special the client asked for (colours, a feature, a section)

## 5. Required content on every client site

1. **Hero** — the business name, one honest line about what they do, one clear
   call to action (call / WhatsApp / directions).
2. **Services & prices** — real names, real prices.
3. **Gallery** — the client's real photos with honest captions.
4. **About** — short, warm, factual.
5. **Opening hours & location** — full week, address, directions link.
6. **Contact** — click-to-call, email, WhatsApp.
7. **A bond page or clearly-linked bond section** titled **"Your bond"** (or
   "Your bond with PYKK"). In plain English it explains:
   - what the bond costs per month and what it includes (their website, hosting,
     updates, support from PYKK)
   - that each month PYKK sends them a **secure pay link** by message, and paying
     it keeps their website online
   - that there's a grace period after the due date, and that if a bill stays
     unpaid past it the website is **temporarily turned off** until it's paid
   - how to contact PYKK to change anything or end the bond
   It must NOT contain any hard-coded payment link (links change monthly), and
   must NOT use the word "subscription".

## 6. Design rules

- Start from the matching template in `sites/_templates/`, but **customise it to
  the business**: adapt the hero wording, colour accents, and section content so
  two PYKK clients never look like the same site with swapped names.
- Keep the template's structure and accessibility features (landmarks, skip link,
  focus styles, alt text, 44px+ tap targets).
- Images: real client photos only, each under ~300 KB (use `--webp`).
- Speed: no layout shift, no heavy shadows, no animations beyond subtle transitions.
- The site must still pass `node scripts/check-site.mjs SLUG` with zero errors
  after every change.

## 7. Never do these

- No "subscription" (see section 1).
- No invented facts, prices, reviews, awards, statistics, or photos.
- No frameworks, CDNs, webfonts, analytics other than the PYKK beacon.
- No editing the repo-root `index.html` (that's the pykk.uk homepage).
- No payment links hard-coded into a site.
- No publishing (`--publish`) before the client's first bond payment — the founder
  confirms payment; if unsure, ask.

## 8. A good opening prompt (what the founder will paste to you)

> New client: read AGENTS.md, docs/CLIENT_SITE_GUIDE.md and docs/NEW_CLIENT.md.
> Client: {name} ({type}), slug {slug}. Prices: {…}. Hours: {…}. Address: {…}.
> Phone/WhatsApp: {…}. Photos are in sites/{slug}/images/. Wants: {special requests}.

Your job then: create the site from the right template, customise it to the brief,
fill every `[[NEEDS INFO]]` you can from the notes (leave the rest as visible
placeholders and list them back to the founder), run the checker, fix everything,
and report what you did in plain English.
