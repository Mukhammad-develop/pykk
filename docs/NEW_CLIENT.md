# Adding a new client — the checklist

Follow these steps in order every time you sign a client. Slugs are the short names
used everywhere: the folder `sites/{slug}`, the address `https://{slug}.pykk.uk`,
and the entry in the admin panel. Slug rules: 3–40 characters, lowercase `a–z`,
`0–9` and hyphens.

## 1. Admin panel — later phase

Once the admin panel is live (phase P3+): add the business at
https://admin.pykk.uk with the **same slug**, the monthly price, and the first
payment date (marked paid). Until then, keep a note of the client and the date.

## 2. Create the site (on your Mac)

```
node scripts/new-site.mjs --slug SLUG --name "BUSINESS NAME" --type TYPE
```

`TYPE` is one of: **barber**, **beauty**, **cafe**, **services**.
The site starts in **preview mode** (hidden from Google via `noindex`).

## 3. Customise it (on your Mac)

Ask Kimi to fill in the site from your notes (real prices, hours, address, phone,
WhatsApp, about text). Put the client's photos in `sites/SLUG/images/` — Kimi will
wire them into the page. Anything unknown stays as a visible `[[NEEDS INFO: …]]`
placeholder; never invent facts.

Preview locally: `npx serve sites/SLUG`

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

## 8. When the client has paid

```
node scripts/new-site.mjs --slug SLUG --publish
git add sites/SLUG && git commit -m "Publish site: BUSINESS NAME" && git push
bash ~/pykk/scripts/update.sh   (in cPanel Terminal)
```

This removes the `noindex` tag so Google can find the site.

---

**Notes**

- The beacon host defaults to `admin.pykk.uk`. If that ever changes, set
  `PUBLIC_APP_HOST` before running `new-site.mjs` (Kimi will handle it).
- Page-view statistics appear in the admin panel from a later phase; the beacon
  tag is already in every template, so nothing needs changing on the sites.
