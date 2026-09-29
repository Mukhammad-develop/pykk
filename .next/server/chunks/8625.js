"use strict";exports.id=8625,exports.ids=[8625],exports.modules={3426:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{M:()=>h});var e=c(77319),f=c(74608),g=a([e,f]);async function h(a){try{let b=(0,e.L)();await b.insert(f.activityLog).values({actor:a.actor,action:a.action,entity:a.entity??null,entityId:null!=a.entityId?String(a.entityId):null,beforeJson:void 0===a.before?null:JSON.parse(JSON.stringify(a.before)),afterJson:void 0===a.after?null:JSON.parse(JSON.stringify(a.after)),ip:a.ip??null})}catch(a){console.error("[pykk] activity log write failed:",a)}}[e,f]=g.then?(await g)():g,d()}catch(a){d(a)}})},13009:(a,b,c)=>{c.d(b,{Q:()=>d});function d(a){return`<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Client area</title>
<link rel="stylesheet" href="https://${a.publicAppHost}/client-panel.css">
<script>window.PYKK_PANEL = { slug: ${JSON.stringify(a.slug)}, api: ${JSON.stringify(`https://${a.publicAppHost}`)} };</script>
</head>
<body>
<div id="app">
  <main class="login-wrap">
    <form id="login-form" class="card">
      <p class="brand">PYKK client area</p>
      <h1>Log in</h1>
      <p class="error" id="login-error" hidden></p>
      <label>Email <input id="login-email" type="email" autocomplete="email" required></label>
      <label>Password <input id="login-password" type="password" autocomplete="current-password" required></label>
      <button type="submit" id="login-button">Log in</button>
    </form>
  </main>
</div>
<script src="https://${a.publicAppHost}/client-panel.js" defer></script>
</body>
</html>
`}},14993:(a,b,c)=>{c.d(b,{Q:()=>k});var d=c(31421),e=c(57975),f=c(76760),g=c.n(f),h=c(28701);let i=(0,e.promisify)(d.execFile);async function j(a,b){let c=[...a],{stdout:d}=await i("git",c,{cwd:g().dirname((0,h.Sb)()),timeout:6e4,env:b?{...process.env,GIT_TERMINAL_PROMPT:"0"}:process.env});return d.trim()}async function k(a,b){let c=process.env.SITE_BUILD_GITHUB_TOKEN;if(!c)return{committed:!1,pushed:!1,message:"SITE_BUILD_GITHUB_TOKEN is not set — files are on the server only (not in git)"};let d=`https://x-access-token:${c}@github.com/Mukhammad-develop/pykk.git`;return(await j(["-c",`http.extraHeader=Authorization: Basic ${Buffer.from(`x-access-token:${c}`).toString("base64")}`,"pull","--ff-only",d,"main"]),await j(["add",`sites/${a}`]),await j(["status","--porcelain",`sites/${a}`]))?(await j(["-c","user.name=pykk-site-factory","-c","user.email=site-factory@pykk.uk","commit","-m",b]),await j(["push",d,"main"]),{committed:!0,pushed:!0,message:"Committed and pushed to git"}):{committed:!1,pushed:!0,message:"Site unchanged — already in git"}}},16699:(a,b,c)=>{c.d(b,{z:()=>h});var d=c(31421),e=c(57975),f=c(84585);let g=(0,e.promisify)(d.execFile);async function h(a,b="pykk.uk"){let c;if(!(0,f.Ac)(a))return{created:!1,sslStarted:!1,message:`Invalid slug "${a}" — refusing to create a subdomain`};let d=`${a}.${b}`;try{let{stdout:a}=await g("uapi",["SubDomain","listsubdomains","--output=json"],{timeout:3e4});c=a}catch(a){return{created:!1,sslStarted:!1,message:`uapi not available (${a.message}) — create the subdomain manually in cPanel`}}if(c.includes(d))return{created:!1,sslStarted:!0,message:`${d} already exists`};try{let{stdout:c}=await g("uapi",["SubDomain","addsubdomain",`domain=${a}`,`rootdomain=${b}`,`dir=pykk/sites/${a}`,"--output=json"],{timeout:3e4});if(!c.includes('"status":1'))return{created:!1,sslStarted:!1,message:`uapi failed to create ${d}: ${c.slice(0,200)}`}}catch(a){return{created:!1,sslStarted:!1,message:`uapi error creating ${d}: ${a.message}`}}let e=!1;try{await g("uapi",["SSL","start_autossl_check"],{timeout:3e4}),e=!0}catch{}return{created:!0,sslStarted:e,message:`Created ${d}${e?" and started AutoSSL":""}`}}},28701:(a,b,c)=>{c.d(b,{EV:()=>m,Sb:()=>j,cc:()=>n,d5:()=>l});var d=c(73024),e=c.n(d),f=c(76760),g=c.n(f);let h="\x3c!-- pykk:paused --\x3e",i=".pykk-paused";function j(){return(process.env.SITES_DIR||g().join(process.env.HOME??"~","pykk","sites")).replace(/^~(?=\/)/,process.env.HOME??"~")}function k(a,b=j()){return g().join(b,a,"index.html")}function l(a,b=j()){let c=k(a,b);return!!e().existsSync(c)&&e().readFileSync(c,"utf8").includes(h)}function m(a,b=j()){let c=k(a,b);if(!e().existsSync(c))return"no-site";if(l(a,b))return"already";let d=c+i;return e().existsSync(d)||e().renameSync(c,d),e().writeFileSync(c,`<!DOCTYPE html>
<html lang="en-GB">
<head>
${h}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Temporarily turned off</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
         font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
         background: #0b0f14; color: #e8edf2; text-align: center; padding: 2rem; }
  h1 { font-size: 1.5rem; margin: 0 0 .5rem; }
  p { color: #9fb0c0; margin: 0; }
</style>
</head>
<body>
<main>
  <h1>This website is temporarily turned off</h1>
  <p>Please contact PYKK to bring it back.</p>
</main>
</body>
</html>
`),"suspended"}function n(a,b=j()){let c=k(a,b),d=c+i;return e().existsSync(c)||e().existsSync(d)?l(a,b)?(e().rmSync(c),e().existsSync(d)&&e().renameSync(d,c),"restored"):"not-suspended":"no-site"}},37927:(a,b,c)=>{c.d(b,{X:()=>q});var d=c(71733);let e=`
.booking-grid { display: grid; gap: .75rem; }
.booking-grid label { display: flex; flex-direction: column; gap: .3rem; font-size: .9rem; color: var(--muted); }
.booking-grid input, .booking-grid select {
  background: var(--surface); color: var(--text); border: 1px solid var(--line);
  border-radius: .5rem; padding: .75rem .8rem; font-size: 1rem; width: 100%;
}
.booking-grid input:focus, .booking-grid select:focus { border-color: var(--accent); outline: none; }
.booking-submit { margin-top: 1rem; width: 100%; text-align: center; }
.booking-error { margin-top: .75rem; background: #450a0a; color: #fca5a5; border: 1px solid #7f1d1d; border-radius: .5rem; padding: .6rem .8rem; font-size: .9rem; }
.booking-success { margin-top: .75rem; background: #064e3b; color: #a7f3d0; border: 1px solid #065f46; border-radius: .5rem; padding: .6rem .8rem; font-size: .9rem; }
@media (min-width: 36rem) {
  .booking-grid { grid-template-columns: 1fr 1fr; }
  .booking-note { grid-column: 1 / -1; }
}
`,f={scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="8.1" y1="7.6" x2="20" y2="19"/><line x1="8.1" y1="16.4" x2="20" y2="5"/>',flame:'<path d="M12 2c1 4-4 6-4 10a4 4 0 0 0 8 0c0-2-1-3-1-3s3 1 3 5a6 6 0 0 1-12 0c0-6 6-8 6-12z"/>',clock:'<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="3" y1="10" x2="21" y2="10"/>',pin:'<path d="M12 22s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="11" r="2.5"/>',phone:'<path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/>',star:'<path d="M12 2l2.9 6.3 6.6.5-5 4.4 1.5 6.5L12 16.9 6 19.7l1.5-6.5-5-4.4 6.6-.5L12 2z"/>',check:'<circle cx="12" cy="12" r="9"/><polyline points="8 12.5 10.8 15.2 16 9.5"/>',sparkles:'<path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3z"/><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z"/>',coffee:'<path d="M4 8h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/><path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2"/><line x1="6" y1="3" x2="6" y2="5"/><line x1="10" y1="3" x2="10" y2="5"/><line x1="14" y1="3" x2="14" y2="5"/>',leaf:'<path d="M5 19C5 11 10 5 19 5c0 9-5 14-14 14z"/><path d="M5 19c3-5 6-8 10-10"/>',heart:'<path d="M12 20s-7-4.5-9-9c-1.5-3.5 1-7 4.5-7 2 0 3.5 1 4.5 2.5C13 5 14.5 4 16.5 4c3.5 0 6 3.5 4.5 7-2 4.5-9 9-9 9z"/>',chat:'<path d="M21 12a8 8 0 0 1-8 8c-1.4 0-2.7-.3-3.9-.9L4 20l.9-5.1A8 8 0 1 1 21 12z"/>',camera:'<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/>',home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>'},g=Object.keys(f);function h(a,b="icon"){let c=f[a]??f.star;return`<svg class="${b}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${c}</svg>`}let i={barber_hair:[{icon:"scissors",title:"Sharp fades"},{icon:"flame",title:"Hot towel finish"},{icon:"clock",title:"Walk-ins welcome"}],beauty_spa:[{icon:"sparkles",title:"Unrushed treatments"},{icon:"leaf",title:"Gentle products"},{icon:"calendar",title:"Easy booking"}],cafe:[{icon:"coffee",title:"Proper coffee"},{icon:"heart",title:"Made with care"},{icon:"pin",title:"Right in town"}],restaurant:[{icon:"flame",title:"Cooked to order"},{icon:"heart",title:"Family recipes"},{icon:"pin",title:"Easy to find"}],cleaning:[{icon:"check",title:"Fully insured"},{icon:"sparkles",title:"Every corner"},{icon:"calendar",title:"Flexible slots"}],laundry:[{icon:"check",title:"Careful handling"},{icon:"clock",title:"Quick turnaround"},{icon:"calendar",title:"Regular pick-ups"}],retail:[{icon:"check",title:"Honest prices"},{icon:"heart",title:"Personal service"},{icon:"pin",title:"Easy to reach"}],local_services:[{icon:"check",title:"Trusted locally"},{icon:"clock",title:"On time, every time"},{icon:"pin",title:"Covering your area"}],other:[{icon:"check",title:"Trusted locally"},{icon:"heart",title:"Personal service"},{icon:"clock",title:"Flexible hours"}]};function j(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function k(a){return`tel:${a.replace(/[^+\d]/g,"")}`}let l={"dark-bold":{bg:"#14110d",text:"#ede6da",muted:"#b3a88f",accent:"#d9a441",accentText:"#14110d",surface:"#1c1913",line:"#3a3324",headingFont:"'Avenir Next Condensed','Arial Narrow',sans-serif",headingTransform:"uppercase"},"light-elegant":{bg:"#faf6f1",text:"#43333a",muted:"#7d6470",accent:"#a4576b",accentText:"#ffffff",surface:"#ffffff",line:"#e3d9d2",headingFont:"Georgia,'Times New Roman',serif",headingTransform:"none"},"warm-rustic":{bg:"#f8f2e4",text:"#3b2a1e",muted:"#7a6450",accent:"#33573c",accentText:"#f8f2e4",surface:"#fffaf0",line:"#d9cbb4",headingFont:"Georgia,'Times New Roman',serif",headingTransform:"none"},"bright-practical":{bg:"#ffffff",text:"#12283f",muted:"#546b85",accent:"#0b5cab",accentText:"#ffffff",surface:"#f5f8fc",line:"#d7e2ee",headingFont:"Helvetica,Arial,sans-serif",headingTransform:"none"}},m=`You are the PYKK website factory. You produce ONE complete, production-ready small-business website as exactly two files: index.html and styles.css. No explanations, no markdown fences with language tags other than exactly these two blocks:

=== index.html ===
(the file)
=== styles.css ===
(the file)

ABSOLUTE RULES (a validator checks every one — failing any means rejection):
1. Static HTML5 + one CSS file. No frameworks, no JavaScript, no CDNs, no webfonts, no image downloads — system font stacks only.
2. Exactly one <h1>. Semantic landmarks (header, nav, main, section, footer) and a visually-hidden skip link. Mobile-first CSS, no horizontal scrolling at 360px. WCAG AA contrast (4.5:1). Tap targets at least 44px. Visible :focus-visible styles.
3. <head> in this order: <meta charset="utf-8">, viewport, <meta name="robots" content="noindex">, <title> with the business name, meta description, <link rel="stylesheet" href="styles.css">. The <html> tag has lang="en-GB".
4. UK English. NO invented facts: no fake reviews, testimonials, ratings, awards, "years of experience", or statistics. Only the facts provided in the intake. Reviews may appear ONLY if explicitly provided as real in the intake — use them verbatim, never write new ones.
5. The public site sells the BUSINESS only. NEVER mention PYKK's billing, bonds, payments, grace periods, websites being turned off, or anything PYKK-internal — and NEVER the word "subscription". The only PYKK presence is the footer credit and the beacon (rules 8 and 9).
6. Sections in this order: hero (business name, one honest tagline from the story, CTA to #contact; if a hero photo is provided, use it as a large backdrop image with a readable dark overlay); #features ("Why choose us" — 3 or 4 cards, each with an inline SVG icon copied EXACTLY from the ICON CATALOG below, a 2–5 word title, and one benefit line drawn from the story); #services (services & prices from the intake, formatted \xa3X.XX); #gallery (the provided photo files as <img src="images/FILENAME" loading="lazy"> with honest alt text — if photos exist this is a STAR section: the first photo large (full width or 2 columns wide), the rest in a tidy grid; if no photos, styled placeholder boxes captioned [[NEEDS INFO: photos]]); #reviews (ONLY if real reviews are provided — a "What customers say" section quoting them verbatim with the given names); #about (the story from the intake, expanded warmly but factually); #book (ONLY when booking is enabled — see rule 10); #visit (opening-hours table + address + a "Get directions" Google Maps link + the OPEN-NOW badge from rule 13); #contact (click-to-call tel:, mailto:, a WhatsApp https://wa.me/<digits> link, and any provided Instagram/Facebook links); footer.
7. Footer: "\xa9 {business name} \xb7 Website by <a href="https://pykk.uk">PYKK</a>".
8. Immediately before </body>: <script src="https://PUBLIC_APP_HOST/pv.js" data-site="SLUG" defer></script>
9. Gallery images: use EXACTLY the photo filenames given. Do not invent other image files.
10. When booking is enabled, the #book section must contain a form with id="booking-form" and data attributes data-slug="SLUG" and data-api="https://PUBLIC_APP_HOST", with fields named exactly: service (a <select> of the intake services), date (type="date"), time (a <select> with half-hour options 09:00–19:30), name, phone, note — followed by <p id="booking-error" hidden></p>, <p id="booking-success" hidden>Booked! We’ll confirm shortly — see you soon.</p>, a submit button with class "booking-submit", and the script tag <script src="https://PUBLIC_APP_HOST/booking.js" defer></script>. Never handle the booking yourself — that script does everything.
11. CRAFT BAR — this is what separates an agency site from a template. Every one of these is expected:
    a. The hero is NOT just a title: an eyebrow/kicker line (small-caps label, e.g. the town or business type), a strong headline, one supporting sentence, and a primary CTA. A provided hero photo fills the hero with a readable dark overlay.
    b. Section rhythm: alternate section backgrounds (page bg vs a subtly different surface), generous vertical padding, a centered max-width container, and each section header has a small eyebrow label above the h2 (e.g. "PRICES", "GALLERY", "VISIT US").
    c. Real depth per the mood: shadows/borders/radius exactly as the mood specifies — never flat default boxes.
    d. Gallery: a proper grid (2–3 columns on desktop), images with object-fit: cover and a subtle hover zoom transition.
    e. #visit embeds Google Maps when an address is provided: <iframe src="https://www.google.com/maps?q=URL_ENCODED_ADDRESS&output=embed" loading="lazy" title="Map" style="border:0"> — full width, ~300px tall, rounded per the mood — in ADDITION to the directions link.
    f. When a phone number is provided, add a sticky mobile call button: <a class="sticky-call" href="tel:…">Call {business name}</a>, position: fixed at the bottom, visible ONLY on screens under 640px, high z-index, the accent colour.
    g. The footer has two columns on desktop (left: business name + the PYKK credit; right: quick contact links) and stacks on mobile.
    h. Hover/focus transitions of 150–250ms ease on interactive elements.
12. OPTIONAL third block === script.js === (vanilla, max 60 lines, no libraries, no external URLs): only if it clearly improves the page — e.g. a mobile nav toggle or a simple gallery lightbox. Omit it otherwise.
13. OPEN-NOW BADGE: in the #visit section include <span class="open-badge" data-open-badge></span> plus an INLINE <script> (this is the only inline script allowed) that embeds the intake hours as a JS object HOURS = {mon:'…',tue:'…',…} (use 'closed' for closed days, 'HH:MM–HH:MM' otherwise), picks today's entry with ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()], and sets the badge's text to "Open now" (class .open) or "Closed now" (class .closed) by comparing the current time against the range — or "Closed today" when the day is closed. Small, dependency-free.
14. WRITE WITH A LOCAL VOICE. Confident and specific: "The sharpest fades in Watford", never "Welcome to our website". The hero tagline and section intros should sound like the proud owner, not a template.

ICON CATALOG (copy the <svg> markup exactly; size and colour are styled via CSS):
ICON_CATALOG_PLACEHOLDER`;function n(a){let b=a.match(/===\s*index\.html\s*===\s*([\s\S]*?)(?====\s*styles\.css\s*===|$)/i),c=a.match(/===\s*styles\.css\s*===\s*([\s\S]*?)(?====\s*script\.js\s*===|$)/i);if(!b||!c)return null;let d=b[1].trim().replace(/^```\w*\n?/,"").replace(/```$/,"").trim(),e=c[1].trim().replace(/^```\w*\n?/,"").replace(/```$/,"").trim();if(!d||!e)return null;let f=a.match(/===\s*script\.js\s*===\s*([\s\S]*?)$/i);return{html:d,css:e,js:(f?f[1].trim().replace(/^```\w*\n?/,"").replace(/```$/,"").trim():void 0)||void 0}}async function o(a,b={}){let c=process.env.OPENROUTER_API_KEY;if(!c)throw Error("OPENROUTER_API_KEY is not set");let d=process.env.OPENROUTER_MODEL||"~anthropic/claude-fable-latest",e=new AbortController,f=setTimeout(()=>e.abort(),24e4);try{let f=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${c}`,"http-referer":"https://pykk.uk","x-title":"PYKK site factory"},body:JSON.stringify({model:d,messages:a,temperature:.4,max_tokens:b.maxTokens??8e3}),signal:e.signal});if(!f.ok){let a=await f.text().catch(()=>"");throw Error(`OpenRouter ${f.status}: ${a.slice(0,300)}`)}let g=await f.json(),h=g?.choices?.[0]?.message?.content;if("string"!=typeof h||h.length<500)throw Error("OpenRouter returned an empty or too-short answer");return h}finally{clearTimeout(f)}}let p=`static HTML+CSS only (no frameworks/CDNs/webfonts); one h1; semantic landmarks; mobile-first; AA contrast; noindex meta; lang="en-GB"; UK English; no invented facts/reviews/stats; never the word "subscription"; no PYKK-internal/bond content; footer "Website by PYKK" linking https://pykk.uk; beacon <script src="https://HOST/pv.js" data-site="SLUG" defer>; photos only from the provided filenames; booking form only if enabled (with the exact booking.js contract); craft bar: eyebrow labels, section rhythm, depth per mood, map embed when address, sticky mobile call button when phone, hover transitions, two-column footer; #features "Why choose us" icon cards (3–4 cards, each with an inline SVG icon from the catalog); open-now badge from the hours; confident LOCAL voice (never "Welcome to our website").`;async function q(a,b){let c=(process.env.PUBLIC_APP_HOST||"admin.pykk.uk").replace(/\/$/,""),f={slug:a.slug,publicAppHost:c},q=[];if(process.env.OPENROUTER_API_KEY)for(let e=1;e<=2;e++){let i={};try{var r,s,t;let j=Date.now(),k=await o(function(a,b){let c=(0,d.W1)(b.mood,a.type);return[{role:"system",content:"You are an award-winning web art director for UK local businesses. You design one-page sites that win clients, not templates. Be concrete and decisive. No generic advice."},{role:"user",content:`Create the art direction for a one-page website.
Business: ${a.name} (${a.type.replace(/_/g," ")})
Mood requested: "${c.label}" — ${c.direction}
Story: ${b.additionalInfo||"not provided"}
Photos available: ${b.photos.length}${b.heroPhoto?" (one will be the hero backdrop)":""}
Takes bookings: ${b.extras.enableBooking?"yes":"no"}

Answer in at most 180 words, exactly these fields:
HERO VARIANT: one of [full-bleed photo hero | split hero (text left, photo right) | editorial centered hero] — pick what suits the photos and mood.
TYPOGRAPHY: heading + body system stacks and the scale relationship (e.g. huge condensed display vs calm serif).
LAYOUT: the section sequence that sells THIS business best (from: services/prices, gallery, reviews, about, booking, visit, contact) and why in one line.
DISTINCTIVE DETAILS: exactly 3 concrete craft details (e.g. "price table as a dark ruled ledger", "gallery as a 2-col masonry with zoom hover", "quote-sized serif reviews").
COLOUR SYSTEM: bg, surface, text, muted, accent, accent-text as hex — tuned to the mood but to THIS business.`}]}(a,b),{maxTokens:1500});i[`attempt${e}.conceptMs`]=Date.now()-j,j=Date.now();let l=await o(function(a,b,c,e,f){let i=(0,d.W1)(b.mood,a.type),j=d.EI.map(([a,c])=>`${c}: ${b.hours[a]||"not provided"}`).join("\n"),k=b.services.map(a=>`${a.name} — ${a.price?`\xa3${a.price}`:"price not provided"}`).join("\n"),l=Object.entries(b.extras).filter(([,a])=>a).map(([a,b])=>`${a}: ${b}`).join("\n"),n=b.reviews.length>0?b.reviews.map(a=>`"${a.text}" — ${a.author}`).join("\n"):"none provided — DO NOT include a reviews section",o=[b.socials.instagram&&`Instagram: ${b.socials.instagram}`,b.socials.facebook&&`Facebook: ${b.socials.facebook}`].filter(Boolean).join("\n")||"none",p=`Business: ${a.name} (type: ${a.type.replace(/_/g," ")}, slug: ${a.slug})
Design mood "${i.label}": ${i.direction}
Public app host for the beacon: ${c}
Hero photo: ${b.heroPhoto&&b.photos.length>0?`use images/${b.photos[0]} as the hero backdrop`:"no hero backdrop"}
Booking section: ${b.extras.enableBooking?"ENABLED — include it per rule 10":"disabled — do NOT include any booking form"}
${f?`
THE APPROVED ART DIRECTION — follow it faithfully (it satisfies the craft bar):
${f}
`:""}

CONTACT
Owner: ${b.ownerName||"not provided"}
Phone: ${b.phone||"not provided"}
WhatsApp: ${b.whatsapp||"not provided"}
Email: ${b.email||"not provided"}
SOCIALS
${o}

LOCATION
Address: ${b.address||"not provided"}
Landmark/town: ${b.landmark||"not provided"}

OPENING HOURS
${j}

SERVICES & PRICES
${k||"not provided"}

EXTRAS
${l||"none"}

STORY / ABOUT
${b.additionalInfo||"not provided"}

REAL REVIEWS (client-supplied — use verbatim if present)
${n}

PHOTO FILES (use exactly these in the gallery, in this order)
${b.photos.length>0?b.photos.join(", "):"none — use placeholder boxes"}

For anything marked "not provided", use a visible [[NEEDS INFO: …]] placeholder — never invent it.
${e&&e.length>0?`
YOUR PREVIOUS ATTEMPT WAS REJECTED for these reasons — fix every one:
- ${e.join("\n- ")}`:""}
Now produce the two files.`;return[{role:"system",content:m.replace("PUBLIC_APP_HOST",c).replace("SLUG",a.slug).replace("ICON_CATALOG_PLACEHOLDER",g.map(a=>`${a}: ${h(a)}`).join("\n"))},{role:"user",content:p}]}(a,b,c,q.length>0?q:void 0,k),{maxTokens:32e3});i[`attempt${e}.buildMs`]=Date.now()-j;let u=n(l);if(!u){q.push(`attempt ${e}: could not find the two files in the model's answer`);continue}j=Date.now();let v=await o((r=u.html,s=u.css,t=p.replace("HOST",c).replace("SLUG",a.slug),[{role:"system",content:`You are the most demanding design QA in the industry. You review one-page sites for UK local businesses. You fix anything that is not excellent, then return the FULL corrected files in this exact format:
=== index.html ===
(corrected file)
=== styles.css ===
(corrected file)
No commentary. If the site is already excellent, return the files unchanged.`},{role:"user",content:`Review this site against:
1) THE RULES (all must hold):
${t}
2) THE ART DIRECTION (it should be faithfully executed):
${k}
${q.length>0?`3) THESE FAILURES MUST BE FIXED:
- ${q.join("\n- ")}`:""}

Weak craft is a failure too: flat sections, default-looking boxes, missing eyebrow labels, weak hero, cramped spacing, missing hover transitions, missing map embed when an address exists, missing sticky call button when a phone exists.

THE SITE TO REVIEW:
=== index.html ===
${r}
=== styles.css ===
${s}`}]),{maxTokens:32e3});i[`attempt${e}.critiqueMs`]=Date.now()-j;let w=n(v)??u,x=function(a,b,c){let d=[],e=a.toLowerCase();return a.includes("<html")&&a.includes("</html>")||d.push("not a complete HTML document"),1!==(a.match(/<h1[\s>]/gi)??[]).length&&d.push("must contain exactly one <h1>"),a.includes('<meta name="robots" content="noindex">')||d.push("missing the noindex meta tag (preview mode)"),a.includes(`data-site="${c.slug}"`)||d.push(`beacon is missing data-site="${c.slug}"`),a.includes(`${c.publicAppHost}/pv.js`)||d.push(`beacon src must be https://${c.publicAppHost}/pv.js`),a.includes('href="https://pykk.uk"')||d.push('missing the "Website by PYKK" footer link to https://pykk.uk'),a.includes('id="features"')||d.push('missing the #features "Why choose us" icon-cards section'),(a.match(/<svg/g)??[]).length<3&&d.push("missing inline SVG icons (need at least 3)"),a.includes("{{")&&d.push("contains unfilled {{TOKEN}} placeholders"),e.includes("subscription")&&d.push('contains the forbidden word "subscription" — use "bond"'),/your bond|monthly bond|bond payment|bond with pykk/i.test(a)&&d.push("contains PYKK-internal bond content — the public site must sell the business only"),(!b||b.length<200)&&d.push("styles.css is missing or too small"),(b.match(/{/g)??[]).length===(b.match(/}/g)??[]).length&&b.trimEnd().endsWith("}")||d.push("styles.css looks truncated (unbalanced braces)"),a.trimEnd().toLowerCase().endsWith("</html>")||d.push("index.html looks truncated (does not end with </html>)"),(a.includes("lorem ipsum")||e.includes("lorem ipsum"))&&d.push("contains lorem ipsum"),a.includes('lang="en-GB"')||d.push('missing lang="en-GB"'),d}(w.html,w.css,f);if(0===x.length){let a=w.js;if(a){let b=function(a,b){let c=[];for(let d of(a.length>4e3&&c.push("script.js is too large (must stay tiny)"),a.includes("eval(")&&c.push("script.js uses eval()"),a.match(/https?:\/\/[^\s'"`)]+/g)??[]))d.includes(b)||d.includes("pykk.uk")||c.push(`script.js references an external URL: ${d.slice(0,60)}`);return c}(a,c);b.length>0&&(q.push(`script.js dropped: ${b.join(", ")}`),a=void 0)}return{...w,js:a,usedFallback:!1,attempts:e,failures:q,steps:i}}q.push(...x.map(a=>`attempt ${e}: ${a}`))}catch(a){q.push(`attempt ${e}: ${a.message.slice(0,200)}`)}}else q.push("OPENROUTER_API_KEY is not set");return{...function(a,b,c){var f;let g=j(a.name),m=a.slug,n=l[(0,d.W1)(b.mood,a.type).id],o=b.heroPhoto&&b.photos.length>0?b.photos[0]:null,p=b.services.length>0?b.services.map(a=>`          <li class="price-row"><span>${j(a.name)}</span><span class="leader"></span><span class="price">${a.price?`\xa3${j(a.price)}`:""}</span></li>`).join("\n"):'          <li class="price-row"><span>[[NEEDS INFO: services & prices]]</span></li>',q=d.EI.map(([a,c])=>{let d=b.hours[a]||"[[NEEDS INFO: hours]]";return`          <tr><th>${c}</th><td>${"closed"===d?"Closed":j(d)}</td></tr>`}).join("\n"),r=b.photos.length>0?b.photos.map((a,b)=>`          <figure><img src="images/${j(a)}" alt="${g} — photo ${b+1}" loading="lazy"></figure>`).join("\n"):'          <div class="photo-placeholder">[[NEEDS INFO: photos]]</div>',s=b.reviews.length>0?`  <section id="reviews" aria-labelledby="reviews-heading">
    <h2 id="reviews-heading">What customers say</h2>
    <div class="reviews">
${b.reviews.map(a=>`      <blockquote>
        <p>“${j(a.text)}”</p>
        <footer>— ${j(a.author)}</footer>
      </blockquote>`).join("\n")}
    </div>
  </section>`:"",t=[];b.extras.barberMode&&t.push("walk-ins"===b.extras.barberMode?"Walk-ins welcome.":"appointments"===b.extras.barberMode?"By appointment — book ahead.":"Walk-ins and appointments."),b.extras.appointmentOnly&&t.push("By appointment only."),b.extras.cafeService&&t.push("both"===b.extras.cafeService?"Eat in or takeaway.":"eat-in"===b.extras.cafeService?"Eat in.":"Takeaway."),b.extras.areasCovered&&t.push(`Covering ${j(b.extras.areasCovered)}.`),b.extras.callOut&&t.push(j(b.extras.callOut));let u=[];b.phone&&u.push(`          <a class="btn btn--primary" href="${k(b.phone)}">Call ${j(b.phone)}</a>`),b.whatsapp&&u.push(`          <a class="btn" href="${(f=b.whatsapp,`https://wa.me/${f.replace(/[^\d]/g,"")}`)}">WhatsApp us</a>`),b.email&&u.push(`          <a class="btn" href="mailto:${j(b.email)}">${j(b.email)}</a>`),b.socials.instagram&&u.push(`          <a class="btn" href="${j(b.socials.instagram)}" target="_blank" rel="noreferrer">Instagram ↗</a>`),b.socials.facebook&&u.push(`          <a class="btn" href="${j(b.socials.facebook)}" target="_blank" rel="noreferrer">Facebook ↗</a>`),0===u.length&&u.push("          <p>[[NEEDS INFO: contact details]]</p>");let v=b.address?`<p class="address">${j(b.address)}</p>
          <a class="directions" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(b.address)}" target="_blank" rel="noreferrer">Get directions ↗</a>
          <iframe class="map" src="https://www.google.com/maps?q=${encodeURIComponent(b.address)}&amp;output=embed" loading="lazy" title="Map" referrerpolicy="no-referrer-when-downgrade"></iframe>`:`<p class="address">[[NEEDS INFO: address]]${b.landmark?` (${j(b.landmark)})`:""}</p>`,w=b.additionalInfo?j(b.additionalInfo):`${g} is a friendly local ${a.type.replace(/_/g," ")}. ${t.join(" ")}`,x=(i[a.type]??i.other).map((a,b)=>`      <div class="feature-card">
        ${h(a.icon)}
        <h3>${j(a.title)}</h3>
        ${t[b]?`<p>${j(t[b])}</p>`:""}
      </div>`).join("\n"),y=JSON.stringify(b.hours).replace(/</g,"\\u003c"),z=`  <p class="open-now"><span class="open-badge" data-open-badge></span></p>
  <script>const HOURS=${y};(function(){var b=document.querySelector('[data-open-badge]');if(!b)return;var k=['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];var v=HOURS[k];function set(t,c){b.textContent=t;b.className='open-badge '+c;}if(!v||v.toLowerCase()==='closed'){set('Closed today','closed');return;}var m=v.match(/(\\d{1,2}):(\\d{2})\\s*[–-]\\s*(\\d{1,2}):(\\d{2})/);if(!m){set('','closed');return;}var n=new Date(),t=n.getHours()*60+n.getMinutes(),o=(+m[1])*60+(+m[2]),c=(+m[3])*60+(+m[4]);set(t>=o&&t<c?'Open now':'Closed now',t>=o&&t<c?'open':'closed');})();</script>`;return{html:`<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${g}</title>
<meta name="description" content="${g} — a local ${a.type.replace(/_/g," ")} in the UK. Services, prices, opening hours and contact.">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <p class="brand">${g}</p>
  <nav aria-label="Main">
    <a href="#services">Services</a>
    <a href="#gallery">Gallery</a>${b.extras.enableBooking?'\n    <a href="#book">Book</a>':""}
    <a href="#visit">Visit</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
<section class="hero${o?" hero--photo":""}" aria-label="Welcome"${o?` style="background-image: linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url('images/${j(o)}')"`:""}>
  <p class="eyebrow">${j(a.type.replace(/_/g," "))}${b.landmark?` \xb7 ${j(b.landmark)}`:""}</p>
  <h1>${g}</h1>
  <p class="tagline">${t.length>0?j(t.join(" ")):`A friendly local ${a.type.replace(/_/g," ")}.`}</p>
  <a class="btn btn--primary" href="#contact">Get in touch</a>
</section>
<main id="main">
  <section id="features" aria-labelledby="features-heading">
    <h2 id="features-heading">Why choose us</h2>
    <div class="feature-grid">
${x}
    </div>
  </section>
  <section id="services" aria-labelledby="services-heading">
    <h2 id="services-heading">Services &amp; prices</h2>
    <ul class="price-list">
${p}
    </ul>
  </section>
  <section id="gallery" aria-labelledby="gallery-heading">
    <h2 id="gallery-heading">Gallery</h2>
    <div class="gallery-grid">
${r}
    </div>
  </section>
${s}
  <section id="about" aria-labelledby="about-heading">
    <h2 id="about-heading">About</h2>
    <p>${w}</p>
  </section>
${b.extras.enableBooking?function(a){let b=a.services.map(a=>`          <option value="${j(a.name)}">${j(a.name)}${a.price?` — \xa3${j(a.price)}`:""}</option>`).join("\n");return`  <section id="book" aria-labelledby="book-heading" class="booking">
    <h2 id="book-heading">Book an appointment</h2>
    <form id="booking-form" data-slug="${a.slug}" data-api="https://${a.publicAppHost}">
      <div class="booking-grid">
        <label>Service
          <select name="service" required>
          <option value="" disabled selected>Choose a service…</option>
${b}
          </select>
        </label>
        <label>Date
          <input name="date" type="date" required>
        </label>
        <label>Time
          <select name="time" required>
            <option value="" disabled selected>Pick a time…</option>
            ${["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30"].map(a=>`<option value="${a}">${a}</option>`).join("\n            ")}
          </select>
        </label>
        <label>Your name
          <input name="name" type="text" autocomplete="name" required>
        </label>
        <label>Your phone
          <input name="phone" type="tel" autocomplete="tel" required>
        </label>
        <label class="booking-note">Note (optional)
          <input name="note" type="text" maxlength="500">
        </label>
      </div>
      <p class="booking-error" id="booking-error" hidden></p>
      <p class="booking-success" id="booking-success" hidden>Booked! We’ll confirm shortly — see you soon.</p>
      <button type="submit" class="btn btn--primary booking-submit">Book appointment</button>
    </form>
    <script src="https://${a.publicAppHost}/booking.js" defer></script>
  </section>`}({slug:m,publicAppHost:c,services:b.services})+"\n":""}  <section id="visit" aria-labelledby="visit-heading">
    <h2 id="visit-heading">Opening hours &amp; location</h2>
${z}
    <table class="hours">
${q}
    </table>
${v}
  </section>
  <section id="contact" aria-labelledby="contact-heading">
    <h2 id="contact-heading">Contact</h2>
    <div class="contact-actions">
${u.join("\n")}
    </div>
  </section>
</main>
<footer>
  <p>\xa9 ${g} \xb7 Website by <a href="https://pykk.uk">PYKK</a></p>
</footer>
${b.phone?`<a class="sticky-call" href="${k(b.phone)}">Call ${g}</a>
`:""}<script src="https://${c}/pv.js" data-site="${m}" defer></script>
</body>
</html>
`,css:`:root {
  --bg: ${n.bg}; --text: ${n.text}; --muted: ${n.muted};
  --accent: ${n.accent}; --accent-text: ${n.accentText};
  --surface: ${n.surface}; --line: ${n.line};
  --heading-font: ${n.headingFont}; --heading-transform: ${n.headingTransform};
}
* { box-sizing: border-box; margin: 0; }
html { scroll-behavior: smooth; }
body {
  font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background: var(--bg); color: var(--text); line-height: 1.6;
}
.skip-link { position: absolute; left: -999px; }
.skip-link:focus { left: 1rem; top: 1rem; background: var(--accent); color: var(--accent-text); padding: .5rem 1rem; z-index: 10; }
h1, h2 { font-family: var(--heading-font); text-transform: var(--heading-transform); }
.site-header {
  display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem; border-bottom: 2px solid var(--line); background: var(--bg);
}
.site-header--overlay { position: absolute; inset: 0 0 auto 0; border: none; background: transparent; }
.brand { font-weight: 800; letter-spacing: .04em; }
.site-header nav { display: flex; gap: 1rem; }
.site-header a { color: inherit; text-decoration: none; padding: .5rem 0; opacity: .85; }
a:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.hero { padding: 3.5rem 1.25rem 2.5rem; text-align: center; border-bottom: 1px solid var(--line); }
.hero--photo {
  background-size: cover; background-position: center; color: #fff;
  border-bottom: none; padding: 5rem 1.25rem 4rem;
}
.hero--photo .tagline { color: #f0f0f0; }
.hero h1 { font-size: clamp(2rem, 7vw, 3.2rem); line-height: 1.1; }
.eyebrow {
  color: var(--accent); font-size: .78rem; font-weight: 700; letter-spacing: .14em;
  text-transform: uppercase; margin-bottom: .6rem;
}
.hero--photo .eyebrow { color: #fff; opacity: .9; }
.tagline { color: var(--muted); margin: .75rem auto 1.5rem; max-width: 34rem; }
.btn {
  display: inline-block; padding: .8rem 1.4rem; border-radius: .5rem; font-weight: 700;
  background: transparent; color: inherit; border: 2px solid var(--accent); text-decoration: none;
}
.btn--primary { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }
main { max-width: 44rem; margin: 0 auto; padding: 0 1.25rem 3rem; }
section { padding: 2.25rem 0 0; }
h2 { font-size: 1.35rem; margin-bottom: 1rem; border-bottom: 2px solid var(--line); padding-bottom: .4rem; }
.price-list { list-style: none; padding: 0; }
.price-row { display: flex; align-items: baseline; gap: .75rem; padding: .55rem 0; border-bottom: 1px dashed var(--line); }
.price-row .leader { flex: 1; border-bottom: 2px dotted var(--muted); transform: translateY(-4px); opacity: .5; }
.price-row .price { font-weight: 700; white-space: nowrap; }
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: .75rem; }
.gallery-grid figure, .photo-placeholder {
  aspect-ratio: 4/3; background: var(--surface); border: 1px solid var(--line); border-radius: .5rem; overflow: hidden;
  display: grid; place-items: center; color: var(--muted); font-size: .85rem; text-align: center; padding: .5rem;
}
.gallery-grid img { width: 100%; height: 100%; object-fit: cover; display: block; }
.reviews { display: grid; gap: 1rem; }
.reviews blockquote { background: var(--surface); border-left: 4px solid var(--accent); border-radius: .5rem; padding: 1rem 1.25rem; }
.reviews blockquote p { font-style: italic; }
.reviews footer { margin-top: .5rem; color: var(--muted); font-size: .9rem; }
.hours { width: 100%; max-width: 22rem; border-collapse: collapse; }
.hours th, .hours td { text-align: left; padding: .4rem 0; border-bottom: 1px solid var(--line); }
.hours td { text-align: right; color: var(--muted); }
.open-now { margin-bottom: .75rem; }
.open-badge {
  display: inline-block; padding: .25rem .8rem; border-radius: 999px; font-size: .82rem; font-weight: 700;
  background: #dcfce7; color: #166534; border: 1px solid #86efac;
}
.open-badge.closed { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: .75rem; }
.feature-card {
  background: var(--surface); border: 1px solid var(--line); border-radius: .6rem; padding: 1rem;
  display: flex; flex-direction: column; gap: .45rem;
}
.feature-card .icon { width: 26px; height: 26px; color: var(--accent); }
.feature-card h3 { font-size: .95rem; }
.feature-card p { color: var(--muted); font-size: .85rem; }
.address { margin-top: 1rem; color: var(--muted); }
.directions { display: inline-block; margin-top: .5rem; color: var(--accent); padding: .5rem 0; }
.contact-actions { display: flex; flex-direction: column; gap: .75rem; }
.contact-actions .btn { text-align: center; padding: .9rem; }
footer { text-align: center; color: var(--muted); font-size: .85rem; padding: 2rem 1rem; border-top: 1px solid var(--line); }
footer a { color: var(--accent); }
.map {
  display: block; width: 100%; height: 300px; border: 1px solid var(--line);
  border-radius: .5rem; margin-top: 1rem;
}
.sticky-call {
  display: none; position: fixed; left: 1rem; right: 1rem; bottom: .75rem; z-index: 20;
  background: var(--accent); color: var(--accent-text); text-align: center; font-weight: 700;
  padding: .9rem; border-radius: .6rem; text-decoration: none; box-shadow: 0 4px 18px rgba(0,0,0,.35);
}
@media (max-width: 640px) {
  .sticky-call { display: block; }
  body { padding-bottom: 3.5rem; }
}
.gallery-grid figure img { transition: transform .25s ease; }
.gallery-grid figure:hover img { transform: scale(1.04); }
.btn { transition: background-color .2s ease, color .2s ease, border-color .2s ease; }
@media (min-width: 40rem) { .contact-actions { flex-direction: row; flex-wrap: wrap; } }
${b.extras.enableBooking?e:""}
`}}(a,b,c),usedFallback:!0,attempts:0,failures:q,steps:{}}}},71733:(a,b,c)=>{c.d(b,{EI:()=>g,W1:()=>e,tX:()=>f});let d=[{id:"dark-bold",label:"Dark & bold",hint:"dramatic, confident, night-time energy",direction:"Dark, masculine, sharp: near-black background #14110d, warm off-white text #ede6da, amber accent #d9a441. Hero: amber small-caps eyebrow, huge condensed uppercase headline (Avenir Next Condensed / Arial Narrow, letter-spacing), thin amber rules above and below. Buttons: 2px solid amber borders, sharp corners, amber fill on the primary. Sections: separated by thin #3a3324 rules, sharp-cornered cards on #1c1913. Price list: ruled table with dotted amber leaders."},{id:"light-elegant",label:"Light & elegant",hint:"calm, airy, premium spa feel",direction:"Light, calm, elegant: cream background #faf6f1, deep plum-grey text #43333a, dusty rose accent #a4576b, soft sage #7d8b76. Hero: rose small-caps eyebrow, large Georgia serif headline, generous whitespace. Buttons: pill-shaped, rose solid primary. Cards: white, 18px radius, soft single shadow. Sections separated by whitespace and hairline #e3d9d2 rules — an airy, premium feel."},{id:"warm-rustic",label:"Warm & rustic",hint:"cosy, welcoming, handcrafted",direction:"Warm, rustic, appetising: paper background #f8f2e4, dark brown text #3b2a1e, forest green accent #33573c, terracotta secondary #b0502a. Hero: terracotta small-caps eyebrow, big Georgia serif headline. Sections separated by dashed hand-drawn-style rules. Menu/price list with dotted leaders. CTA: 3px double-bordered stamp-style button, uppercase letter-spacing. Cards on #fffaf0 with 1px #d9cbb4 borders."},{id:"bright-practical",label:"Bright & practical",hint:"clean, fresh, trustworthy",direction:"Bright, practical, trustworthy: white background, navy text #12283f, strong blue accent #0b5cab, warm yellow #f2b705 highlights on dark areas only. Hero: blue small-caps eyebrow, bold Helvetica/Arial headline, solid blue CTA. Cards: #f5f8fc with a 4px left blue accent border, 8px radius. Clean grid, big tap targets, footer on navy #12283f with white text."}];function e(a,b){let c=d.find(b=>b.id===a);if(c)return c;let e={barber_hair:"dark-bold",beauty_spa:"light-elegant",cafe:"warm-rustic",restaurant:"warm-rustic",cleaning:"bright-practical",laundry:"bright-practical",retail:"bright-practical",local_services:"bright-practical",other:"dark-bold"};return d.find(a=>a.id===(e[b??""]??"dark-bold"))}let f={ownerName:"",phone:"",whatsapp:"",email:"",address:"",landmark:"",hours:{},services:[],additionalInfo:"",mood:"",reviews:[],socials:{instagram:"",facebook:""},heroPhoto:!1,extras:{},photos:[]},g=[["mon","Monday"],["tue","Tuesday"],["wed","Wednesday"],["thu","Thursday"],["fri","Friday"],["sat","Saturday"],["sun","Sunday"]]},84585:(a,b,c)=>{c.d(b,{Ac:()=>f});let d=["www","admin","app","api","mail","webmail","cpanel","ftp","pay","status","pykk","internal"],e=/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;function f(a){return e.test(a)&&!d.includes(a)}},88625:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{S:()=>t});var e=c(73024),f=c.n(e),g=c(76760),h=c.n(g),i=c(11737),j=c(77319),k=c(74608),l=c(28701),m=c(3426),n=c(37927),o=c(14993),p=c(16699),q=c(13009),r=c(71733),s=a([i,j,k,m]);async function t(a){let b=(0,j.L)(),c=(await b.select().from(k.businesses).where((0,i.eq)(k.businesses.id,a)).limit(1))[0];if(!c)return;let d=async c=>{await b.update(k.businesses).set({websiteStatus:"failed",websiteNote:c.slice(0,255)}).where((0,i.eq)(k.businesses.id,a)),await (0,m.M)({actor:"system",action:"website.build_failed",entity:"business",entityId:a,after:{note:c}})};await b.update(k.businesses).set({websiteStatus:"building",websiteNote:null}).where((0,i.eq)(k.businesses.id,a));try{let d={...r.tX,...c.intakeJson??{}},e=await (0,n.X)(c,d),g=(process.env.PUBLIC_APP_HOST||"admin.pykk.uk").replace(/\/$/,""),j=h().join((0,l.Sb)(),c.slug);f().mkdirSync(h().join(j,"admin"),{recursive:!0});let s=`?v=${Date.now()}`,t=e.html.replace(/href="styles\.css(\?[^"]*)?"/g,`href="styles.css${s}"`).replace(/src="script\.js(\?[^"]*)?"/g,`src="script.js${s}"`);f().writeFileSync(h().join(j,"index.html"),t),f().writeFileSync(h().join(j,"styles.css"),e.css),e.js?f().writeFileSync(h().join(j,"script.js"),e.js):f().existsSync(h().join(j,"script.js"))&&f().rmSync(h().join(j,"script.js")),f().writeFileSync(h().join(j,"admin","index.html"),(0,q.Q)({slug:c.slug,publicAppHost:g}));let u=await (0,o.Q)(c.slug,`Add site: ${c.name} (site factory)`),v=await (0,p.z)(c.slug),w=[e.usedFallback?"fallback template used":"AI-drafted",u.message,v.message].join(" \xb7 ");await b.update(k.businesses).set({websiteStatus:e.usedFallback?"live_fallback":"live",websiteBuiltAt:new Date,websiteNote:w.slice(0,255)}).where((0,i.eq)(k.businesses.id,a)),await (0,m.M)({actor:"system",action:"website.built",entity:"business",entityId:a,after:{usedFallback:e.usedFallback,attempts:e.attempts,steps:e.steps,failures:e.failures.slice(0,6),note:w}})}catch(a){await d(a.message)}}[i,j,k,m]=s.then?(await s)():s,d()}catch(a){d(a)}})}};