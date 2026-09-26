# Adding a new client — the checklist

Follow these steps in order every time you sign a client. Slugs are the short names
used everywhere: the folder `sites/{slug}`, the address `https://{slug}.pykk.uk`,
and the entry in the admin panel. Slug rules: 3–40 characters, lowercase `a–z`,
`0–9` and hyphens.

**Vocabulary:** the client's monthly payment relationship with PYKK is a **bond** —
never write "subscription". Every AI chat building or customising the site must
follow `docs/CLIENT_SITE_GUIDE.md`.

## 1. Admin panel — add the business

At https://admin.pykk.uk: **+ Add business** — name, slug (same as the site folder
you'll create), type, owner contact, monthly price, and the billing anchor date
(default: today). This instantly creates the client's **first bond bill**, due on
the anchor date, with its `#` reference. (From Phase 3: paste the pay link you
create in Stripe into that bill, tap **Copy message for client**, and send it by
WhatsApp. The client pays — the bond has started. They have the grace period
— default 7 days — to pay before the site is temporarily turned off.)

## 2. Create the site (on your Mac)

```
node scripts/new-site.mjs --slug SLUG --name "BUSINESS NAME" --type TYPE
```

`TYPE` is one of: **barber**, **beauty**, **cafe**, **services**.
The site starts in **preview mode** (hidden from Google via `noindex`).

## 3. Customise it (on your Mac)

Open a chat in the `pykk` folder and say:
> New client: read AGENTS.md, docs/CLIENT_SITE_GUIDE.md and docs/NEW_CLIENT.md.
> Client: …(name, type, prices, hours, address, phone/WhatsApp, special requests)…
> Photos are in sites/SLUG/images/.

Put the client's photos in `sites/SLUG/images/` first. The chat fills in the real
facts, builds the bond page, checks the site, and pushes.

## 4. Check it (on your Mac)

```
node scripts/check-site.mjs SLUG
```

Fix every ❌ it prints (ask Kimi — paste the output). Heavy images? Run
`node scripts/check-site.mjs SLUG --webp` to shrink them.

## 5. Push it (on your Mac)

```
git add sites/SLUG && git commit -m "Add site: BUSINESS NAME" && git push
```

## 6. Publish to the internet (cPanel Terminal)

```
bash ~/pykk/scripts/update.sh
```

This creates `SLUG.pykk.uk` automatically (if it doesn't exist yet) and starts the
SSL check. If it prints manual subdomain steps instead, follow them in cPanel →
Domains and tell Kimi.

## 7. Check on your phone

Open `https://SLUG.pykk.uk`. The padlock can take a few minutes to appear while
AutoSSL runs. The site is still in preview mode — hidden from Google but viewable
by anyone with the link, so send it to the client for approval.

## 8. When the client pays their first bond bill

Mark the bill paid in the admin panel (Phase 3), then:

```
node scripts/new-site.mjs --slug SLUG --publish
git add sites/SLUG && git commit -m "Publish site: BUSINESS NAME" && git push
bash ~/pykk/scripts/update.sh   (in cPanel Terminal)
```

This removes the `noindex` tag so Google can find the site.

## 9. Every month after

The daily job creates the next bill 7 days before it's due. You paste the pay
link, copy the message, and the client pays. Bills have a grace period (default
7 days, no extra charge); if a bill stays unpaid past grace, the website shows a
"temporarily turned off" page and returns the moment they pay.

---

**Notes**

- The beacon host defaults to `admin.pykk.uk`. If that ever changes, set
  `PUBLIC_APP_HOST` before running `new-site.mjs` (Kimi will handle it).
- Page-view statistics appear in the admin panel from a later phase; the beacon
  tag is already in every template, so nothing needs changing on the sites.
