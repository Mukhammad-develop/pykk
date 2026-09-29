"use strict";exports.id=8625,exports.ids=[8625],exports.modules={3426:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{M:()=>h});var e=c(77319),f=c(74608),g=a([e,f]);async function h(a){try{let b=(0,e.L)();await b.insert(f.activityLog).values({actor:a.actor,action:a.action,entity:a.entity??null,entityId:null!=a.entityId?String(a.entityId):null,beforeJson:void 0===a.before?null:JSON.parse(JSON.stringify(a.before)),afterJson:void 0===a.after?null:JSON.parse(JSON.stringify(a.after)),ip:a.ip??null})}catch(a){console.error("[pykk] activity log write failed:",a)}}[e,f]=g.then?(await g)():g,d()}catch(a){d(a)}})},7115:(a,b,c)=>{c.d(b,{X:()=>m});var d=c(94845),e=c(67131),f=c(71733),g=c(79678),h=c(75468),i=c(69659);let j=`
img { max-width: 100%; height: auto; display: block; }
.container { width: min(1120px, 100% - 2.5rem); margin-inline: auto; }
section { padding-block: clamp(3rem, 8vw, 5.5rem); }
h1, h2, h3 { line-height: 1.05; text-wrap: balance; }
p { max-width: 62ch; }
a { color: inherit; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; border-radius: 2px; }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; animation: none !important; } }
`,k=[{id:"heritage-barber",moodId:"dark-bold",label:"Heritage Barber",conceptHint:"Near-black editorial: Fraunces display, amber accents, uppercase condensed headings, thin rules, a ruled price table with dotted leaders, sharp corners. Confident, masculine, heritage.",baseCss:`:root {
  --bg: #14110d; --surface: #1c1913; --text: #ede6da; --muted: #b3a88f;
  --accent: #d9a441; --accent-ink: #14110d; --line: #3a3324;
  --display: clamp(2.75rem, 8.5vw, 5.5rem);
  --step--1: clamp(.8rem, .77rem + .15vw, .9rem);
  --step-0: clamp(1rem, .95rem + .25vw, 1.15rem);
  --step-1: clamp(1.3rem, 1.1rem + 1vw, 1.9rem);
  --step-2: clamp(1.8rem, 1.4rem + 2vw, 2.9rem);
}
body { background: var(--bg); color: var(--text); font-size: var(--step-0); line-height: 1.65; }
h1, h2, h3, .brand { letter-spacing: .04em; text-transform: uppercase; }
h1 { font-size: var(--display); letter-spacing: .02em; }
h2 { font-size: var(--step-2); }
.eyebrow { color: var(--accent); font-size: var(--step--1); letter-spacing: .18em; text-transform: uppercase; }
.btn { display: inline-block; padding: .9em 1.6em; border: 2px solid var(--accent); color: var(--text); text-decoration: none; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.btn--primary { background: var(--accent); color: var(--accent-ink); }
.rule { border: 0; border-top: 1px solid var(--line); margin-block: 2rem; }
.price-table { border-top: 2px solid var(--accent); }
.price-row { display: flex; align-items: baseline; gap: 1rem; padding: .8rem 0; border-bottom: 1px dashed var(--line); }
.price-row .name { font-weight: 600; }
.price-row .leader { flex: 1; border-bottom: 2px dotted #4a5a3c; transform: translateY(-5px); opacity: .6; }
.price-row .price { color: var(--accent); font-weight: 800; white-space: nowrap; }
.card { background: var(--surface); border: 1px solid var(--line); padding: 1.25rem; }
${j}`},{id:"luxe-beauty",moodId:"light-elegant",label:"Luxe Beauty",conceptHint:"Light spa elegance: Instrument Serif, cream and dusty rose, airy whitespace, 18px soft cards, pill buttons, italic pull quotes. Calm and premium.",baseCss:`:root {
  --bg: #faf6f1; --surface: #ffffff; --text: #43333a; --muted: #7d6470;
  --accent: #a4576b; --accent-ink: #ffffff; --sage: #7d8b76; --line: #e3d9d2;
  --display: clamp(2.5rem, 7vw, 4.6rem);
  --step--1: clamp(.8rem, .77rem + .15vw, .9rem);
  --step-0: clamp(1rem, .95rem + .25vw, 1.12rem);
  --step-1: clamp(1.25rem, 1.05rem + 1vw, 1.75rem);
  --step-2: clamp(1.7rem, 1.35rem + 1.8vw, 2.6rem);
}
body { background: var(--bg); color: var(--text); font-size: var(--step-0); line-height: 1.7; }
h1 { font-size: var(--display); font-weight: 400; }
h2 { font-size: var(--step-2); font-weight: 400; }
.eyebrow { color: var(--accent); font-size: var(--step--1); letter-spacing: .16em; text-transform: uppercase; }
.btn { display: inline-block; padding: .85em 1.7em; border-radius: 999px; border: 1.5px solid var(--accent); color: var(--accent); text-decoration: none; font-weight: 600; }
.btn--primary { background: var(--accent); color: var(--accent-ink); }
.card { background: var(--surface); border-radius: 18px; padding: 1.5rem; box-shadow: 0 10px 30px -18px rgba(67, 51, 58, .25); }
.price-row { display: flex; justify-content: space-between; gap: 1rem; padding: .7rem 0; border-bottom: 1px solid var(--line); }
.price-row .price { color: var(--accent); font-weight: 600; white-space: nowrap; }
blockquote { font-style: italic; border-left: 3px solid var(--sage); padding-left: 1.2rem; color: var(--muted); }
${j}`},{id:"cafe-menu",moodId:"warm-rustic",label:"Warm Caf\xe9 Menu",conceptHint:"Paper-menu warmth: DM Serif, cream paper stock, forest and terracotta, dashed hand-drawn rules, dotted leaders in the menu, stamp-style bordered CTAs. Cosy and appetising.",baseCss:`:root {
  --bg: #f8f2e4; --surface: #fffaf0; --text: #3b2a1e; --muted: #7a6450;
  --accent: #33573c; --accent-ink: #f8f2e4; --accent2: #b0502a; --line: #d9cbb4;
  --display: clamp(2.6rem, 7.5vw, 4.8rem);
  --step--1: clamp(.8rem, .77rem + .15vw, .9rem);
  --step-0: clamp(1rem, .95rem + .25vw, 1.15rem);
  --step-1: clamp(1.25rem, 1.05rem + 1vw, 1.8rem);
  --step-2: clamp(1.75rem, 1.35rem + 2vw, 2.7rem);
}
body { background: var(--bg); color: var(--text); font-size: var(--step-0); line-height: 1.66; }
h1 { font-size: var(--display); }
h2 { font-size: var(--step-2); }
.eyebrow { color: var(--accent2); font-size: var(--step--1); letter-spacing: .14em; text-transform: uppercase; font-weight: 700; }
.btn { display: inline-block; padding: .8em 1.5em; border: 3px double var(--accent); color: var(--accent); text-decoration: none; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; background: var(--surface); }
.btn--primary { background: var(--accent); color: var(--accent-ink); }
.rule { border: 0; border-top: 2px dashed var(--line); margin-block: 2.2rem; }
.menu-item { display: flex; align-items: baseline; gap: .8rem; padding: .6rem 0; }
.menu-item .leader { flex: 1; border-bottom: 2px dotted var(--muted); transform: translateY(-4px); opacity: .55; }
.menu-item .price { color: var(--accent2); font-weight: 800; white-space: nowrap; }
.card { background: var(--surface); border: 1px solid var(--line); padding: 1.4rem; }
.stamp { display: inline-block; padding: .35em .9em; border: 3px double var(--accent2); color: var(--accent2); font-weight: 800; letter-spacing: .1em; text-transform: uppercase; transform: rotate(-2deg); }
${j}`},{id:"clean-services",moodId:"bright-practical",label:"Clean Services",conceptHint:"Bright trustworthy utility: Space Grotesk, white and strong blue, 4px left-accent cards, solid blue CTAs, pills for quick facts. Crisp and practical.",baseCss:`:root {
  --bg: #ffffff; --surface: #f5f8fc; --text: #12283f; --muted: #546b85;
  --accent: #0b5cab; --accent-ink: #ffffff; --highlight: #f2b705; --line: #d7e2ee;
  --display: clamp(2.4rem, 7vw, 4.4rem);
  --step--1: clamp(.8rem, .77rem + .15vw, .9rem);
  --step-0: clamp(1rem, .95rem + .25vw, 1.12rem);
  --step-1: clamp(1.25rem, 1.05rem + 1vw, 1.75rem);
  --step-2: clamp(1.7rem, 1.35rem + 1.8vw, 2.6rem);
}
body { background: var(--bg); color: var(--text); font-size: var(--step-0); line-height: 1.65; }
h1 { font-size: var(--display); font-weight: 700; }
h2 { font-size: var(--step-2); font-weight: 700; }
.eyebrow { color: var(--accent); font-size: var(--step--1); letter-spacing: .14em; text-transform: uppercase; font-weight: 700; }
.btn { display: inline-block; padding: .9em 1.6em; border-radius: 8px; background: var(--accent); color: var(--accent-ink); text-decoration: none; font-weight: 700; }
.btn--ghost { background: transparent; border: 2px solid var(--accent); color: var(--accent); }
.card { background: var(--surface); border-left: 4px solid var(--accent); border-radius: 8px; padding: 1.25rem 1.4rem; }
.price-row { display: flex; justify-content: space-between; gap: 1rem; padding: .75rem 0; border-bottom: 1px solid var(--line); }
.price-row .price { color: var(--accent); font-weight: 700; white-space: nowrap; }
.pill { display: inline-block; padding: .3em .9em; border-radius: 999px; background: var(--surface); border: 1px solid var(--line); font-size: var(--step--1); font-weight: 600; }
${j}`}];function l(a,b){let c=k.find(b=>b.id===a);if(c)return c;let d={barber_hair:"heritage-barber",beauty_spa:"luxe-beauty",cafe:"cafe-menu",restaurant:"cafe-menu",cleaning:"clean-services",laundry:"clean-services",retail:"clean-services",local_services:"clean-services",other:"heritage-barber"};return k.find(a=>a.id===(d[b??""]??"heritage-barber"))}async function m(a,b){let j=(process.env.PUBLIC_APP_HOST||"admin.pykk.uk").replace(/\/$/,""),k={slug:a.slug,publicAppHost:j},m=[];if(process.env.OPENROUTER_API_KEY)for(let d=1;d<=2;d++){let p={};try{var n,o;let q=Date.now(),r=await (0,h.O)(function(a,b){let c=(0,f.W1)(b.mood,a.type);return[{role:"system",content:'You are an award-winning web art director for UK local businesses. You have exactly one job here: give the page its IDEA — one sentence that makes it belong to this shop. Everything else follows from that sentence. Be decisive and specific. Example of the standard: "The price list is the hero, set like a 1960s barbershop board, because Marco\'s prices are his pitch."'},{role:"user",content:`Business: ${a.name} (a ${(0,g.D)(a.type)}${b.landmark?` in ${b.landmark}`:""})
Mood requested: "${c.label}" — ${c.direction}
Story: ${b.additionalInfo||"not provided"}
Photos: ${b.photos.length}${b.heroPhoto?" (one will be the hero backdrop)":""}
Takes bookings: ${b.extras.enableBooking?"yes":"no"}

Answer in at most 140 words, exactly these fields:
ARCHETYPE: one of [heritage-barber | luxe-beauty | cafe-menu | clean-services] — pick the closest starting point, adapted freely.
THE IDEA: one sentence — the concept that makes this site belong to THIS shop.
HERO ELEMENT: the single thing that leads the page (a photo, the price board, the owner, or the headline) and why.
TYPE: a type scale relationship (e.g. huge condensed display vs calm serif body) — dramatic contrast.
PALETTE: 3 colours + 1 neutral with roles (page, surface, text, accent), hex values tuned to the mood.
SIGNATURE: one motif or detail a customer would remember.
SECTION PLAN: the section sequence, where NO two consecutive sections share a layout, and the ONE thing each section does with its content.`}]}(a,b),{maxTokens:1500});p[`attempt${d}.conceptMs`]=Date.now()-q;let s=l(r.match(/ARCHETYPE:\s*([a-z-]+)/i)?.[1],a.type);q=Date.now();let t=await (0,h.O)((0,e.f)(a,b,j,m.length>0?m:void 0,r,s),{maxTokens:32e3});p[`attempt${d}.buildMs`]=Date.now()-q;let u=(0,e.l)(t);if(!u){m.push(`attempt ${d}: could not find the two files in the model's answer`);continue}q=Date.now();let v=await (0,h.O)((n=u.html,o=u.css,[{role:"system",content:`You are the most demanding design director in the country, reviewing a one-page site for a paying local business. You judge TASTE and CONCEPT FIDELITY, never compliance. Fix anything that feels weak, then return the FULL corrected files in this exact format:
=== index.html ===
(corrected file)
=== styles.css ===
(corrected file)
No commentary. If the site is already excellent, return the files unchanged.`},{role:"user",content:`THE CONCEPT (the site must embody it):
${r}
${m.length>0?`
THE VALIDATOR REJECTED THE PREVIOUS VERSION FOR:
- ${m.join("\n- ")}
Fix every one.`:""}

Ask of every section: does this feel crafted for THIS business, or like a template? Kill filler copy, dead space, flat hierarchy, repetitive layouts, and any of these generic patterns (rows of three icon cards, alternating grey/white bands, eyebrows over every heading, centred-everything). Keep the booking/map markers <!--BOOKING--> and <!--MAP--> exactly as they are if present. Keep the lang="en-GB" attribute. Keep every fact verbatim.

THE SITE:
=== index.html ===
${n}
=== styles.css ===
${o}`}]),{maxTokens:32e3});p[`attempt${d}.critiqueMs`]=Date.now()-q;let w=(0,e.l)(v)??u,x=(0,i.Q)(w.html,w.css,k);if(0===x.length){q=Date.now();let f={applied:[],skipped:[]};try{let{runCouncil:d}=await c.e(3686).then(c.bind(c,53686)),e=await d(w,{business:a,intake:b,concept:r,host:j,slug:a.slug});w.html=e.html,w.css=e.css,e.js&&(w.js=e.js),f={applied:e.applied,skipped:e.skipped}}catch(a){f.skipped.push({model:"council",reason:a.message.slice(0,120)})}p[`attempt${d}.councilMs`]=Date.now()-q,q=Date.now();try{let{lookAndCritique:d}=await c.e(175).then(c.bind(c,10175)),f=await d(w.html,w.css);if(f){let c=await (0,h.O)([...(0,e.f)(a,b,j,void 0,r,s),{role:"user",content:`A senior designer looked at the rendered page (desktop + mobile screenshots) and demands these visual fixes — apply every one WITHOUT breaking anything and WITHOUT touching the markers:
${f.critique}

Here are the files to revise:
=== index.html ===
${w.html}
=== styles.css ===
${w.css}`}],{maxTokens:32e3}),d=(0,e.l)(c);d&&0===(0,i.Q)(d.html,d.css,k).length&&(w.html=d.html,w.css=d.css,d.js&&(w.js=d.js))}}catch(a){m.push(`eyes pass skipped: ${a.message.slice(0,120)}`)}p[`attempt${d}.eyesMs`]=Date.now()-q;let g=w.js;if(g){let a=(0,i.O)(g,j);a.length>0&&(m.push(`script.js dropped: ${a.join(", ")}`),g=void 0)}return{...w,js:g,usedFallback:!1,attempts:d,failures:m,archetype:s,council:f,steps:p}}m.push(...x.map(a=>`attempt ${d}: ${a}`))}catch(a){m.push(`attempt ${d}: ${a.message.slice(0,200)}`)}}else m.push("OPENROUTER_API_KEY is not set");return{...(0,d.D)(a,b,j),usedFallback:!0,attempts:0,failures:m,archetype:l(void 0,a.type),council:{applied:[],skipped:[]},steps:{}}}},13009:(a,b,c)=>{c.d(b,{Q:()=>d});function d(a){return`<!DOCTYPE html>
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
`}},14993:(a,b,c)=>{c.d(b,{Q:()=>k});var d=c(31421),e=c(57975),f=c(76760),g=c.n(f),h=c(28701);let i=(0,e.promisify)(d.execFile);async function j(a,b){let c=[...a],{stdout:d}=await i("git",c,{cwd:g().dirname((0,h.Sb)()),timeout:6e4,env:b?{...process.env,GIT_TERMINAL_PROMPT:"0"}:process.env});return d.trim()}async function k(a,b){let c=process.env.SITE_BUILD_GITHUB_TOKEN;if(!c)return{committed:!1,pushed:!1,message:"SITE_BUILD_GITHUB_TOKEN is not set — files are on the server only (not in git)"};let d=`https://x-access-token:${c}@github.com/Mukhammad-develop/pykk.git`;return(await j(["-c",`http.extraHeader=Authorization: Basic ${Buffer.from(`x-access-token:${c}`).toString("base64")}`,"pull","--ff-only",d,"main"]),await j(["add",`sites/${a}`]),await j(["status","--porcelain",`sites/${a}`]))?(await j(["-c","user.name=pykk-site-factory","-c","user.email=site-factory@pykk.uk","commit","-m",b]),await j(["push",d,"main"]),{committed:!0,pushed:!0,message:"Committed and pushed to git"}):{committed:!1,pushed:!0,message:"Site unchanged — already in git"}}},16699:(a,b,c)=>{c.d(b,{z:()=>h});var d=c(31421),e=c(57975),f=c(84585);let g=(0,e.promisify)(d.execFile);async function h(a,b="pykk.uk"){let c;if(!(0,f.Ac)(a))return{created:!1,sslStarted:!1,message:`Invalid slug "${a}" — refusing to create a subdomain`};let d=`${a}.${b}`;try{let{stdout:a}=await g("uapi",["SubDomain","listsubdomains","--output=json"],{timeout:3e4});c=a}catch(a){return{created:!1,sslStarted:!1,message:`uapi not available (${a.message}) — create the subdomain manually in cPanel`}}if(c.includes(d))return{created:!1,sslStarted:!0,message:`${d} already exists`};try{let{stdout:c}=await g("uapi",["SubDomain","addsubdomain",`domain=${a}`,`rootdomain=${b}`,`dir=pykk/sites/${a}`,"--output=json"],{timeout:3e4});if(!c.includes('"status":1'))return{created:!1,sslStarted:!1,message:`uapi failed to create ${d}: ${c.slice(0,200)}`}}catch(a){return{created:!1,sslStarted:!1,message:`uapi error creating ${d}: ${a.message}`}}let e=!1;try{await g("uapi",["SSL","start_autossl_check"],{timeout:3e4}),e=!0}catch{}return{created:!0,sslStarted:e,message:`Created ${d}${e?" and started AutoSSL":""}`}}},17479:(a,b,c)=>{c.d(b,{IG:()=>k,mi:()=>j,qE:()=>i});var d=c(73024),e=c.n(d),f=c(76760),g=c.n(f);let h=[{file:"inter-400.woff2",family:"Inter",weight:400},{file:"inter-700.woff2",family:"Inter",weight:700}],i={"dark-bold":{display:"Fraunces",body:"Inter",files:[{file:"fraunces-700.woff2",family:"Fraunces",weight:700},...h]},"light-elegant":{display:"Instrument Serif",body:"Inter",files:[{file:"instrument-serif-400.woff2",family:"Instrument Serif",weight:400},...h]},"warm-rustic":{display:"DM Serif Display",body:"Inter",files:[{file:"dm-serif-display-400.woff2",family:"DM Serif Display",weight:400},...h]},"bright-practical":{display:"Space Grotesk",body:"Inter",files:[{file:"space-grotesk-700.woff2",family:"Space Grotesk",weight:700},...h]}};function j(a){let b=a.files.map(a=>`@font-face {
  font-family: '${a.family}';
  src: url('fonts/${a.file}') format('woff2');
  font-weight: ${a.weight};
  font-style: normal;
  font-display: swap;
}`).join("\n");return`
/* self-hosted fonts (subset, latin) */
${b}
body { font-family: '${a.body}', ui-sans-serif, system-ui, sans-serif; }
h1, h2, h3, .brand, .display { font-family: '${a.display}', Georgia, serif; }
`}function k(a,b){let c=g().join(b,"fonts");e().mkdirSync(c,{recursive:!0});let d=[];for(let b of a.files){let a=g().join(g().join(process.cwd(),"font-assets"),b.file);e().existsSync(a)&&(e().copyFileSync(a,g().join(c,b.file)),d.push(b.file))}return d}},20557:(a,b,c)=>{c.d(b,{M:()=>e,c:()=>f});var d=c(94845);function e(a){let b=d.Z,c=a.services.map(a=>`          <option value="${b(a.name)}">${b(a.name)}${a.price?` — \xa3${b(a.price)}`:""}</option>`).join("\n");return`  <section id="book" aria-label="Book an appointment" class="booking">
    <form id="booking-form" data-slug="${a.slug}" data-api="https://${a.publicAppHost}">
      <div class="booking-grid">
        <label>Service
          <select name="service" required>
          <option value="" disabled selected>Choose a service…</option>
${c}
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
  </section>`}let f=`
.booking-grid { display: grid; gap: .9rem; }
.booking-grid label { display: flex; flex-direction: column; gap: .4rem; font-size: .95rem; font-weight: 600; color: var(--text); }
.booking-grid input, .booking-grid select {
  background: var(--surface); color: var(--text); border: 1.5px solid var(--line);
  border-radius: .6rem; padding: .85rem .9rem; font-size: 1.05rem; width: 100%;
  transition: border-color .2s ease;
}
.booking-grid input:focus, .booking-grid select:focus { border-color: var(--accent); outline: none; }
.booking-submit { margin-top: 1.2rem; width: 100%; text-align: center; padding: 1rem; font-size: 1.05rem; }
.booking-error { margin-top: .75rem; background: #450a0a; color: #fca5a5; border: 1px solid #7f1d1d; border-radius: .5rem; padding: .6rem .8rem; font-size: .9rem; }
.booking-success { margin-top: .75rem; background: #064e3b; color: #a7f3d0; border: 1px solid #065f46; border-radius: .5rem; padding: .6rem .8rem; font-size: .9rem; }
@media (min-width: 36rem) {
  .booking-grid { grid-template-columns: 1fr 1fr; }
  .booking-note { grid-column: 1 / -1; }
}
`},28701:(a,b,c)=>{c.d(b,{EV:()=>m,Sb:()=>j,cc:()=>n,d5:()=>l});var d=c(73024),e=c.n(d),f=c(76760),g=c.n(f);let h="\x3c!-- pykk:paused --\x3e",i=".pykk-paused";function j(){return(process.env.SITES_DIR||g().join(process.env.HOME??"~","pykk","sites")).replace(/^~(?=\/)/,process.env.HOME??"~")}function k(a,b=j()){return g().join(b,a,"index.html")}function l(a,b=j()){let c=k(a,b);return!!e().existsSync(c)&&e().readFileSync(c,"utf8").includes(h)}function m(a,b=j()){let c=k(a,b);if(!e().existsSync(c))return"no-site";if(l(a,b))return"already";let d=c+i;return e().existsSync(d)||e().renameSync(c,d),e().writeFileSync(c,`<!DOCTYPE html>
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
`),"suspended"}function n(a,b=j()){let c=k(a,b),d=c+i;return e().existsSync(c)||e().existsSync(d)?l(a,b)?(e().rmSync(c),e().existsSync(d)&&e().renameSync(d,c),"restored"):"not-suspended":"no-site"}},67131:(a,b,c)=>{c.d(b,{f:()=>g,l:()=>h});var d=c(71733),e=c(79678);let f=`You are the lead designer at a small, excellent UK studio. Local business owners pay you \xa3500+ for a one-page site because yours never look like templates — each one looks like it could only belong to that shop.

Your brief contains: a concept, a design direction, finished facts (prices, hours, story, real reviews), and photo filenames.

How to work:
1. Commit fully to the concept. When in doubt, make the choice that serves the concept, not the safe one.
2. Build the page from a design system: a type scale with dramatic contrast (display type feels confident and large), a spacing rhythm, 2–3 colours used with discipline, and one signature detail a customer would remember.
3. Choose each section's layout for its content. No two consecutive sections share a layout. A beautifully set price list sells more than any illustration. Four prices might become an oversized typographic list; two reviews might become one huge pull quote.
4. AVOID the generic patterns unless the concept truly demands them: rows of three icon cards, alternating grey/white bands, eyebrow labels over every heading, centred-everything layouts.
5. Mobile first: design for a 390px phone held one-handed, where the call and book actions are always within thumb reach. Then let it open up at larger widths.
6. Write with a confident LOCAL voice — "The sharpest fades in Watford", never "Welcome to our website".

Facts: state only what is in the brief. Reviews are verbatim. Never invent years, awards, numbers or credentials. If a claim isn't in the brief, leave it out. Never write the word "subscription" and never mention PYKK's billing.

Output contract — exactly two blocks (plus an optional third):
=== index.html ===
(the file)
=== styles.css ===
(the file)
=== script.js === (optional, vanilla, max 60 lines, no libraries)

Mechanics:
- The <html> tag gets lang="en-GB". The <head> contains, in this order: <meta charset="utf-8">, a viewport meta, <title> with the business name, <link rel="stylesheet" href="styles.css">.
- Where the booking form belongs, place exactly the marker <!--BOOKING--> (only when booking is enabled in the brief). Never build a booking form yourself.
- Where the map belongs, place exactly the marker <!--MAP--> (only when an address is in the brief). Never build a map embed yourself.
- Do NOT add any analytics scripts, beacons, noindex tags, or footer credits — those are injected after you.
- Use EXACTLY the photo filenames given, only in the gallery/hero. Do not invent other image files.

Craft bar (what makes it feel \xa3500): dramatic type contrast, generous negative space, a real grid gallery with hover zoom, hover/focus transitions (150–250ms), a sticky mobile call button when a phone is provided, a two-column footer on desktop.`;function g(a,b,c,g,h,i){let j=(0,d.W1)(b.mood,a.type),k=d.EI.map(([a,c])=>`${c}: ${b.hours[a]||"not provided"}`).join("\n"),l=b.services.map(a=>`${a.name} — ${a.price?`\xa3${a.price}`:"price not provided"}`).join("\n"),m=Object.entries(b.extras).filter(([,a])=>a).map(([a,b])=>`${a}: ${b}`).join("\n"),n=b.reviews.length>0?b.reviews.map(a=>`"${a.text}" — ${a.author}`).join("\n"):"none provided — DO NOT include a reviews section",o=[b.socials.instagram&&`Instagram: ${b.socials.instagram}`,b.socials.facebook&&`Facebook: ${b.socials.facebook}`].filter(Boolean).join("\n")||"none";return[{role:"system",content:f},{role:"user",content:`Business: ${a.name} (a ${(0,e.D)(a.type)}, slug: ${a.slug})
${i?`DESIGN FOUNDATION "${i.label}" — extend it freely, keep its spirit; do NOT rewrite or override it:
${i.conceptHint}
Its base stylesheet (build on top of this, adding sections and colour roles):
${i.baseCss}
`:`Design mood "${j.label}": ${j.direction}
`}
Hero photo: ${b.heroPhoto&&b.photos.length>0?`use images/${b.photos[0]} as the hero backdrop`:"no hero backdrop"}
Booking: ${b.extras.enableBooking?"ENABLED — place the \x3c!--BOOKING--\x3e marker where the form belongs":"disabled — no \x3c!--BOOKING--\x3e marker"}
Map: ${b.address?`place the <!--MAP--> marker (address: ${b.address})`:"no address — no \x3c!--MAP--\x3e marker"}
${h?`
THE APPROVED ART DIRECTION — commit to it faithfully:
${h}
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
${k}

SERVICES & PRICES
${l||"not provided"}

EXTRAS
${m||"none"}

STORY
${b.additionalInfo||"not provided"}

REAL REVIEWS (use verbatim if present)
${n}

PHOTO FILES (use exactly these, in this order)
${b.photos.length>0?b.photos.join(", "):"none — use placeholder boxes"}

For anything marked "not provided", use a visible [[NEEDS INFO: …]] placeholder — never invent it.
${g&&g.length>0?`
YOUR PREVIOUS ATTEMPT WAS REJECTED for these reasons — fix every one:
- ${g.join("\n- ")}`:""}
Now produce the files.`}]}function h(a){let b=a.match(/===\s*index\.html\s*===\s*([\s\S]*?)(?====\s*styles\.css\s*===|$)/i),c=a.match(/===\s*styles\.css\s*===\s*([\s\S]*?)(?====\s*script\.js\s*===|$)/i);if(!b||!c)return null;let d=b[1].trim().replace(/^```\w*\n?/,"").replace(/```$/,"").trim(),e=c[1].trim().replace(/^```\w*\n?/,"").replace(/```$/,"").trim();if(!d||!e)return null;let f=a.match(/===\s*script\.js\s*===\s*([\s\S]*?)$/i);return{html:d,css:e,js:(f?f[1].trim().replace(/^```\w*\n?/,"").replace(/```$/,"").trim():void 0)||void 0}}},69659:(a,b,c)=>{function d(a,b,c,e={}){let f=[],g=a.toLowerCase();return a.includes("<html")&&a.includes("</html>")||f.push("not a complete HTML document"),a.trimEnd().toLowerCase().endsWith("</html>")||f.push("index.html looks truncated (does not end with </html>)"),1!==(a.match(/<h1[\s>]/gi)??[]).length&&f.push("must contain exactly one <h1>"),a.includes("{{")&&f.push("contains unfilled {{TOKEN}} placeholders"),g.includes("subscription")&&f.push('contains the forbidden word "subscription" — use "bond"'),/your bond|monthly bond|bond payment|bond with pykk/i.test(a)&&f.push("contains PYKK-internal bond content — the public site must sell the business only"),(!b||b.length<200)&&f.push("styles.css is missing or too small"),(b.match(/{/g)??[]).length===(b.match(/}/g)??[]).length&&b.trimEnd().endsWith("}")||f.push("styles.css looks truncated (unbalanced braces)"),(a.includes("lorem ipsum")||g.includes("lorem ipsum"))&&f.push("contains lorem ipsum"),a.includes('lang="en-GB"')||f.push('missing lang="en-GB"'),e.shipped?(a.includes('<meta name="robots" content="noindex">')||f.push("missing the noindex meta tag (preview mode)"),a.includes('href="https://pykk.uk"')||f.push('missing the "Website by PYKK" footer link'),a.includes(`${c.publicAppHost}/pv.js`)&&a.includes(`data-site="${c.slug}"`)||f.push("missing the page-view beacon")):(a.includes('id="booking-form"')&&f.push("do not build the booking form — place the \x3c!--BOOKING--\x3e marker instead"),a.includes("google.com/maps")&&f.push("do not build the map embed — place the \x3c!--MAP--\x3e marker instead"),a.includes("/pv.js")&&f.push("do not add the beacon — it is injected in code"),a.includes('name="robots" content="noindex"')&&f.push("do not add the noindex tag — it is injected in code"),a.includes('href="https://pykk.uk"')&&f.push("do not add the footer credit — it is injected in code")),f}function e(a,b){let c=[];for(let d of(a.length>4e3&&c.push("script.js is too large (must stay tiny)"),a.includes("eval(")&&c.push("script.js uses eval()"),a.match(/https?:\/\/[^\s'"`)]+/g)??[]))d.includes(b)||d.includes("pykk.uk")||c.push(`script.js references an external URL: ${d.slice(0,60)}`);return c}c.d(b,{O:()=>e,Q:()=>d})},71733:(a,b,c)=>{c.d(b,{EI:()=>g,W1:()=>e,tX:()=>f});let d=[{id:"dark-bold",label:"Dark & bold",hint:"dramatic, confident, night-time energy",direction:"Dark, masculine, sharp: near-black background #14110d, warm off-white text #ede6da, amber accent #d9a441. Hero: amber small-caps eyebrow, huge condensed uppercase headline (Avenir Next Condensed / Arial Narrow, letter-spacing), thin amber rules above and below. Buttons: 2px solid amber borders, sharp corners, amber fill on the primary. Sections: separated by thin #3a3324 rules, sharp-cornered cards on #1c1913. Price list: ruled table with dotted amber leaders."},{id:"light-elegant",label:"Light & elegant",hint:"calm, airy, premium spa feel",direction:"Light, calm, elegant: cream background #faf6f1, deep plum-grey text #43333a, dusty rose accent #a4576b, soft sage #7d8b76. Hero: rose small-caps eyebrow, large Georgia serif headline, generous whitespace. Buttons: pill-shaped, rose solid primary. Cards: white, 18px radius, soft single shadow. Sections separated by whitespace and hairline #e3d9d2 rules — an airy, premium feel."},{id:"warm-rustic",label:"Warm & rustic",hint:"cosy, welcoming, handcrafted",direction:"Warm, rustic, appetising: paper background #f8f2e4, dark brown text #3b2a1e, forest green accent #33573c, terracotta secondary #b0502a. Hero: terracotta small-caps eyebrow, big Georgia serif headline. Sections separated by dashed hand-drawn-style rules. Menu/price list with dotted leaders. CTA: 3px double-bordered stamp-style button, uppercase letter-spacing. Cards on #fffaf0 with 1px #d9cbb4 borders."},{id:"bright-practical",label:"Bright & practical",hint:"clean, fresh, trustworthy",direction:"Bright, practical, trustworthy: white background, navy text #12283f, strong blue accent #0b5cab, warm yellow #f2b705 highlights on dark areas only. Hero: blue small-caps eyebrow, bold Helvetica/Arial headline, solid blue CTA. Cards: #f5f8fc with a 4px left blue accent border, 8px radius. Clean grid, big tap targets, footer on navy #12283f with white text."}];function e(a,b){let c=d.find(b=>b.id===a);if(c)return c;let e={barber_hair:"dark-bold",beauty_spa:"light-elegant",cafe:"warm-rustic",restaurant:"warm-rustic",cleaning:"bright-practical",laundry:"bright-practical",retail:"bright-practical",local_services:"bright-practical",other:"dark-bold"};return d.find(a=>a.id===(e[b??""]??"dark-bold"))}let f={ownerName:"",phone:"",whatsapp:"",email:"",address:"",landmark:"",hours:{},services:[],additionalInfo:"",mood:"",reviews:[],socials:{instagram:"",facebook:""},heroPhoto:!1,extras:{},photos:[]},g=[["mon","Monday"],["tue","Tuesday"],["wed","Wednesday"],["thu","Thursday"],["fri","Friday"],["sat","Saturday"],["sun","Sunday"]]},75468:(a,b,c)=>{async function d(a,b={}){return e(process.env.OPENROUTER_MODEL||"~anthropic/claude-fable-latest",a,b)}async function e(a,b,c={}){let d=process.env.OPENROUTER_API_KEY;if(!d)throw Error("OPENROUTER_API_KEY is not set");let f=new AbortController,g=setTimeout(()=>f.abort(),24e4);try{let e=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${d}`,"http-referer":"https://pykk.uk","x-title":"PYKK site factory"},body:JSON.stringify({model:a,messages:b,temperature:.4,max_tokens:c.maxTokens??8e3}),signal:f.signal});if(!e.ok){let a=await e.text().catch(()=>"");throw Error(`OpenRouter ${e.status}: ${a.slice(0,300)}`)}let g=await e.json(),h=g?.choices?.[0]?.message?.content;if("string"!=typeof h||h.length<500)throw Error("OpenRouter returned an empty or too-short answer");return h}finally{clearTimeout(g)}}async function f(a,b){let c=process.env.OPENROUTER_API_KEY;if(!c)throw Error("OPENROUTER_API_KEY is not set");let d=process.env.OPENROUTER_MODEL||"~anthropic/claude-fable-latest",e=new AbortController,f=setTimeout(()=>e.abort(),12e4);try{let f=await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${c}`,"http-referer":"https://pykk.uk","x-title":"PYKK site factory (eyes)"},body:JSON.stringify({model:d,messages:[{role:"user",content:[{type:"text",text:a},...b.map(a=>({type:"image_url",image_url:{url:`data:${a.mediaType};base64,${a.data}`}}))]}],temperature:.2,max_tokens:1500}),signal:e.signal});if(!f.ok){let a=await f.text().catch(()=>"");throw Error(`OpenRouter vision ${f.status}: ${a.slice(0,200)}`)}let g=await f.json();return g?.choices?.[0]?.message?.content??""}finally{clearTimeout(f)}}c.d(b,{O:()=>d,callOpenRouterVision:()=>f,q:()=>e})},79678:(a,b,c)=>{c.d(b,{D:()=>f,n:()=>g});var d=c(20557),e=c(94845);function f(a){return({barber_hair:"barbershop",beauty_spa:"beauty salon",cafe:"caf\xe9",restaurant:"restaurant",cleaning:"cleaning service",laundry:"laundry service",retail:"local shop",local_services:"local services business",other:"local business"})[a]??"local business"}function g(a,b){let c=a;if(/<meta\s+charset/i.test(c)||(c=c.replace(/<head>/i,'<head>\n<meta charset="utf-8">')),/name="viewport"/i.test(c)||(c=c.replace(/<head>/i,'<head>\n<meta name="viewport" content="width=device-width, initial-scale=1">')),/name="robots"\s+content="noindex"/i.test(c)||(c=c.replace(/(<meta\s+name="viewport"[^>]*>)/i,`$1
<meta name="robots" content="noindex">`)),!/<meta\s+name="description"/i.test(c)&&b.description&&(c=c.replace(/(<meta\s+name="robots"[^>]*>)/i,`$1
<meta name="description" content="${(0,e.Z)(b.description)}">`)),c.includes("\x3c!--BOOKING--\x3e")){let a=b.bookingEnabled?(0,d.M)({slug:b.slug,publicAppHost:b.publicAppHost,services:b.services}):"";c=c.replace("\x3c!--BOOKING--\x3e",a)}if(c.includes("\x3c!--MAP--\x3e")){let a=b.address?`<iframe class="map" src="https://www.google.com/maps?q=${encodeURIComponent(b.address)}&amp;output=embed" loading="lazy" title="Map" referrerpolicy="no-referrer-when-downgrade"></iframe>`:"";c=c.replace("\x3c!--MAP--\x3e",a)}let f='<a href="https://pykk.uk">PYKK</a>';return c.includes('href="https://pykk.uk"')||(c=c.includes("</footer>")?c.replace("</footer>",`  <p>Website by ${f}</p>
</footer>`):c.replace("</main>",`</main>
<footer>
  <p>Website by ${f}</p>
</footer>`)),c.includes("/pv.js")||(c=c.replace("</body>",`<script src="https://${b.publicAppHost}/pv.js" data-site="${b.slug}" defer></script>
</body>`)),c}},84585:(a,b,c)=>{c.d(b,{Ac:()=>f});let d=["www","admin","app","api","mail","webmail","cpanel","ftp","pay","status","pykk","internal"],e=/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;function f(a){return e.test(a)&&!d.includes(a)}},88625:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{S:()=>v});var e=c(73024),f=c.n(e),g=c(76760),h=c.n(g),i=c(11737),j=c(77319),k=c(74608),l=c(28701),m=c(3426),n=c(7115),o=c(14993),p=c(16699),q=c(13009),r=c(79678),s=c(17479),t=c(71733),u=a([i,j,k,m]);async function v(a){let b=(0,j.L)(),c=(await b.select().from(k.businesses).where((0,i.eq)(k.businesses.id,a)).limit(1))[0];if(!c)return;let d=async c=>{await b.update(k.businesses).set({websiteStatus:"failed",websiteNote:c.slice(0,255)}).where((0,i.eq)(k.businesses.id,a)),await (0,m.M)({actor:"system",action:"website.build_failed",entity:"business",entityId:a,after:{note:c}})};await b.update(k.businesses).set({websiteStatus:"building",websiteNote:null}).where((0,i.eq)(k.businesses.id,a));try{let d={...t.tX,...c.intakeJson??{}},e=await (0,n.X)(c,d),g=(process.env.PUBLIC_APP_HOST||"admin.pykk.uk").replace(/\/$/,""),j=(0,r.n)(e.html,{slug:c.slug,businessName:c.name,description:`${c.name} — a local ${(0,r.D)(c.type)} in the UK.`,publicAppHost:g,bookingEnabled:!!d.extras.enableBooking,services:d.services,address:d.address}),u=h().join((0,l.Sb)(),c.slug);f().mkdirSync(h().join(u,"admin"),{recursive:!0});let v=`?v=${Date.now()}`,w=j.replace(/href="styles\.css(\?[^"]*)?"/g,`href="styles.css${v}"`).replace(/src="script\.js(\?[^"]*)?"/g,`src="script.js${v}"`);f().writeFileSync(h().join(u,"index.html"),w);let x=s.qE[e.archetype.moodId];f().writeFileSync(h().join(u,"styles.css"),e.css+(0,s.mi)(x)),(0,s.IG)(x,u),e.js?f().writeFileSync(h().join(u,"script.js"),e.js):f().existsSync(h().join(u,"script.js"))&&f().rmSync(h().join(u,"script.js")),f().writeFileSync(h().join(u,"admin","index.html"),(0,q.Q)({slug:c.slug,publicAppHost:g}));let y=await (0,o.Q)(c.slug,`Add site: ${c.name} (site factory)`),z=await (0,p.z)(c.slug),A=[e.usedFallback?"fallback template used":"AI-drafted",e.council.applied.length>0?`council: ${e.council.applied.join(" → ")}`:null,y.message,z.message].filter(Boolean).join(" \xb7 ");await b.update(k.businesses).set({websiteStatus:e.usedFallback?"live_fallback":"live",websiteBuiltAt:new Date,websiteNote:A.slice(0,255)}).where((0,i.eq)(k.businesses.id,a)),await (0,m.M)({actor:"system",action:"website.built",entity:"business",entityId:a,after:{usedFallback:e.usedFallback,attempts:e.attempts,archetype:e.archetype.id,council:e.council,steps:e.steps,failures:e.failures.slice(0,6),note:A}})}catch(a){await d(a.message)}}[i,j,k,m]=u.then?(await u)():u,d()}catch(a){d(a)}})},94845:(a,b,c)=>{c.d(b,{Z:()=>i,D:()=>l});var d=c(71733),e=c(20557),f=c(79678);let g={scissors:'<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="8.1" y1="7.6" x2="20" y2="19"/><line x1="8.1" y1="16.4" x2="20" y2="5"/>',flame:'<path d="M12 2c1 4-4 6-4 10a4 4 0 0 0 8 0c0-2-1-3-1-3s3 1 3 5a6 6 0 0 1-12 0c0-6 6-8 6-12z"/>',clock:'<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="3" y1="10" x2="21" y2="10"/>',pin:'<path d="M12 22s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="11" r="2.5"/>',phone:'<path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/>',star:'<path d="M12 2l2.9 6.3 6.6.5-5 4.4 1.5 6.5L12 16.9 6 19.7l1.5-6.5-5-4.4 6.6-.5L12 2z"/>',check:'<circle cx="12" cy="12" r="9"/><polyline points="8 12.5 10.8 15.2 16 9.5"/>',sparkles:'<path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3z"/><path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z"/>',coffee:'<path d="M4 8h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/><path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2"/><line x1="6" y1="3" x2="6" y2="5"/><line x1="10" y1="3" x2="10" y2="5"/><line x1="14" y1="3" x2="14" y2="5"/>',leaf:'<path d="M5 19C5 11 10 5 19 5c0 9-5 14-14 14z"/><path d="M5 19c3-5 6-8 10-10"/>',heart:'<path d="M12 20s-7-4.5-9-9c-1.5-3.5 1-7 4.5-7 2 0 3.5 1 4.5 2.5C13 5 14.5 4 16.5 4c3.5 0 6 3.5 4.5 7-2 4.5-9 9-9 9z"/>',chat:'<path d="M21 12a8 8 0 0 1-8 8c-1.4 0-2.7-.3-3.9-.9L4 20l.9-5.1A8 8 0 1 1 21 12z"/>',camera:'<rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/>',home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>'};Object.keys(g);let h={barber_hair:[{icon:"scissors",title:"Sharp fades"},{icon:"flame",title:"Hot towel finish"},{icon:"clock",title:"Walk-ins welcome"}],beauty_spa:[{icon:"sparkles",title:"Unrushed treatments"},{icon:"leaf",title:"Gentle products"},{icon:"calendar",title:"Easy booking"}],cafe:[{icon:"coffee",title:"Proper coffee"},{icon:"heart",title:"Made with care"},{icon:"pin",title:"Right in town"}],restaurant:[{icon:"flame",title:"Cooked to order"},{icon:"heart",title:"Family recipes"},{icon:"pin",title:"Easy to find"}],cleaning:[{icon:"check",title:"Fully insured"},{icon:"sparkles",title:"Every corner"},{icon:"calendar",title:"Flexible slots"}],laundry:[{icon:"check",title:"Careful handling"},{icon:"clock",title:"Quick turnaround"},{icon:"calendar",title:"Regular pick-ups"}],retail:[{icon:"check",title:"Honest prices"},{icon:"heart",title:"Personal service"},{icon:"pin",title:"Easy to reach"}],local_services:[{icon:"check",title:"Trusted locally"},{icon:"clock",title:"On time, every time"},{icon:"pin",title:"Covering your area"}],other:[{icon:"check",title:"Trusted locally"},{icon:"heart",title:"Personal service"},{icon:"clock",title:"Flexible hours"}]};function i(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function j(a){return`tel:${a.replace(/[^+\d]/g,"")}`}let k={"dark-bold":{bg:"#14110d",text:"#ede6da",muted:"#b3a88f",accent:"#d9a441",accentText:"#14110d",surface:"#1c1913",line:"#3a3324",headingFont:"'Avenir Next Condensed','Arial Narrow',sans-serif",headingTransform:"uppercase"},"light-elegant":{bg:"#faf6f1",text:"#43333a",muted:"#7d6470",accent:"#a4576b",accentText:"#ffffff",surface:"#ffffff",line:"#e3d9d2",headingFont:"Georgia,'Times New Roman',serif",headingTransform:"none"},"warm-rustic":{bg:"#f8f2e4",text:"#3b2a1e",muted:"#7a6450",accent:"#33573c",accentText:"#f8f2e4",surface:"#fffaf0",line:"#d9cbb4",headingFont:"Georgia,'Times New Roman',serif",headingTransform:"none"},"bright-practical":{bg:"#ffffff",text:"#12283f",muted:"#546b85",accent:"#0b5cab",accentText:"#ffffff",surface:"#f5f8fc",line:"#d7e2ee",headingFont:"Helvetica,Arial,sans-serif",headingTransform:"none"}};function l(a,b,c){var l;let m=i,n=m(a.name),o=a.slug,p=k[(0,d.W1)(b.mood,a.type).id],q=b.heroPhoto&&b.photos.length>0?b.photos[0]:null,r=b.services.length>0?b.services.map(a=>`          <li class="price-row"><span>${m(a.name)}</span><span class="leader"></span><span class="price">${a.price?`\xa3${m(a.price)}`:""}</span></li>`).join("\n"):'          <li class="price-row"><span>[[NEEDS INFO: services & prices]]</span></li>',s=d.EI.map(([a,c])=>{let d=b.hours[a]||"[[NEEDS INFO: hours]]";return`          <tr><th>${c}</th><td>${"closed"===d?"Closed":m(d)}</td></tr>`}).join("\n"),t=b.photos.length>0?b.photos.map((a,b)=>`          <figure><img src="images/${m(a)}" alt="${n} — photo ${b+1}" loading="lazy"></figure>`).join("\n"):'          <div class="photo-placeholder">[[NEEDS INFO: photos]]</div>',u=b.reviews.length>0?`  <section id="reviews" aria-labelledby="reviews-heading">
    <h2 id="reviews-heading">What customers say</h2>
    <div class="reviews">
${b.reviews.map(a=>`      <blockquote>
        <p>“${m(a.text)}”</p>
        <footer>— ${m(a.author)}</footer>
      </blockquote>`).join("\n")}
    </div>
  </section>`:"",v=[];b.extras.barberMode&&v.push("walk-ins"===b.extras.barberMode?"Walk-ins welcome.":"appointments"===b.extras.barberMode?"By appointment — book ahead.":"Walk-ins and appointments."),b.extras.appointmentOnly&&v.push("By appointment only."),b.extras.cafeService&&v.push("both"===b.extras.cafeService?"Eat in or takeaway.":"eat-in"===b.extras.cafeService?"Eat in.":"Takeaway."),b.extras.areasCovered&&v.push(`Covering ${m(b.extras.areasCovered)}.`),b.extras.callOut&&v.push(m(b.extras.callOut));let w=[];b.phone&&w.push(`          <a class="btn btn--primary" href="${j(b.phone)}">Call ${m(b.phone)}</a>`),b.whatsapp&&w.push(`          <a class="btn" href="${(l=b.whatsapp,`https://wa.me/${l.replace(/[^\d]/g,"")}`)}">WhatsApp us</a>`),b.email&&w.push(`          <a class="btn" href="mailto:${m(b.email)}">${m(b.email)}</a>`),b.socials.instagram&&w.push(`          <a class="btn" href="${m(b.socials.instagram)}" target="_blank" rel="noreferrer">Instagram ↗</a>`),b.socials.facebook&&w.push(`          <a class="btn" href="${m(b.socials.facebook)}" target="_blank" rel="noreferrer">Facebook ↗</a>`),0===w.length&&w.push("          <p>[[NEEDS INFO: contact details]]</p>");let x=b.address?`<p class="address">${m(b.address)}</p>
          <a class="directions" href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(b.address)}" target="_blank" rel="noreferrer">Get directions ↗</a>
          <iframe class="map" src="https://www.google.com/maps?q=${encodeURIComponent(b.address)}&amp;output=embed" loading="lazy" title="Map" referrerpolicy="no-referrer-when-downgrade"></iframe>`:`<p class="address">[[NEEDS INFO: address]]${b.landmark?` (${m(b.landmark)})`:""}</p>`,y=b.additionalInfo?m(b.additionalInfo):`${n} is a friendly local ${(0,f.D)(a.type)}. ${v.join(" ")}`,z=(h[a.type]??h.other).map((a,b)=>`      <div class="feature-card">
        ${function(a,b="icon"){let c=g[a]??g.star;return`<svg class="${b}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${c}</svg>`}(a.icon)}
        <h3>${m(a.title)}</h3>
        ${v[b]?`<p>${m(v[b])}</p>`:""}
      </div>`).join("\n"),A=JSON.stringify(b.hours).replace(/</g,"\\u003c"),B=`  <p class="open-now"><span class="open-badge" data-open-badge></span></p>
  <script>const HOURS=${A};(function(){var b=document.querySelector('[data-open-badge]');if(!b)return;var k=['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];var v=HOURS[k];function set(t,c){b.textContent=t;b.className='open-badge '+c;}if(!v||v.toLowerCase()==='closed'){set('Closed today','closed');return;}var m=v.match(/(\\d{1,2}):(\\d{2})\\s*[–-]\\s*(\\d{1,2}):(\\d{2})/);if(!m){set('','closed');return;}var n=new Date(),t=n.getHours()*60+n.getMinutes(),o=(+m[1])*60+(+m[2]),c=(+m[3])*60+(+m[4]);set(t>=o&&t<c?'Open now':'Closed now',t>=o&&t<c?'open':'closed');})();</script>`;return{html:`<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${n}</title>
<meta name="description" content="${n} — a local ${(0,f.D)(a.type)} in the UK. Services, prices, opening hours and contact.">
<link rel="stylesheet" href="styles.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <p class="brand">${n}</p>
  <nav aria-label="Main">
    <a href="#services">Services</a>
    <a href="#gallery">Gallery</a>${b.extras.enableBooking?'\n    <a href="#book">Book</a>':""}
    <a href="#visit">Visit</a>
    <a href="#contact">Contact</a>
  </nav>
</header>
<section class="hero${q?" hero--photo":""}" aria-label="Welcome"${q?` style="background-image: linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url('images/${m(q)}')"`:""}>
  <p class="eyebrow">${m((0,f.D)(a.type))}${b.landmark?` \xb7 ${m(b.landmark)}`:""}</p>
  <h1>${n}</h1>
  <p class="tagline">${v.length>0?m(v.join(" ")):`A friendly local ${(0,f.D)(a.type)}.`}</p>
  <a class="btn btn--primary" href="#contact">Get in touch</a>
</section>
<main id="main">
  <section id="features" aria-labelledby="features-heading">
    <h2 id="features-heading">Why choose us</h2>
    <div class="feature-grid">
${z}
    </div>
  </section>
  <section id="services" aria-labelledby="services-heading">
    <h2 id="services-heading">Services &amp; prices</h2>
    <ul class="price-list">
${r}
    </ul>
  </section>
  <section id="gallery" aria-labelledby="gallery-heading">
    <h2 id="gallery-heading">Gallery</h2>
    <div class="gallery-grid">
${t}
    </div>
  </section>
${u}
  <section id="about" aria-labelledby="about-heading">
    <h2 id="about-heading">About</h2>
    <p>${y}</p>
  </section>
${b.extras.enableBooking?(0,e.M)({slug:o,publicAppHost:c,services:b.services})+"\n":""}  <section id="visit" aria-labelledby="visit-heading">
    <h2 id="visit-heading">Opening hours &amp; location</h2>
${B}
    <table class="hours">
${s}
    </table>
${x}
  </section>
  <section id="contact" aria-labelledby="contact-heading">
    <h2 id="contact-heading">Contact</h2>
    <div class="contact-actions">
${w.join("\n")}
    </div>
  </section>
</main>
<footer>
  <p>\xa9 ${n} \xb7 Website by <a href="https://pykk.uk">PYKK</a></p>
</footer>
${b.phone?`<a class="sticky-call" href="${j(b.phone)}">Call ${n}</a>
`:""}<script src="https://${c}/pv.js" data-site="${o}" defer></script>
</body>
</html>
`,css:`:root {
  --bg: ${p.bg}; --text: ${p.text}; --muted: ${p.muted};
  --accent: ${p.accent}; --accent-text: ${p.accentText};
  --surface: ${p.surface}; --line: ${p.line};
  --heading-font: ${p.headingFont}; --heading-transform: ${p.headingTransform};
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
${b.extras.enableBooking?e.c:""}
`}}}};