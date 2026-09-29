"use strict";exports.id=8625,exports.ids=[8625],exports.modules={7115:(a,b,c)=>{c.d(b,{X:()=>m});var d=c(94845),e=c(67131),f=c(71733),g=c(79678),h=c(75468),i=c(69659);let j=`
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
`}},16699:(a,b,c)=>{c.d(b,{z:()=>h});var d=c(31421),e=c(57975),f=c(84585);let g=(0,e.promisify)(d.execFile);async function h(a,b="pykk.uk"){let c;if(!(0,f.Ac)(a))return{created:!1,sslStarted:!1,message:`Invalid slug "${a}" — refusing to create a subdomain`};let d=`${a}.${b}`;try{let{stdout:a}=await g("uapi",["SubDomain","listsubdomains","--output=json"],{timeout:3e4});c=a}catch(a){return{created:!1,sslStarted:!1,message:`uapi not available (${a.message}) — create the subdomain manually in cPanel`}}if(c.includes(d))return{created:!1,sslStarted:!0,message:`${d} already exists`};try{let{stdout:c}=await g("uapi",["SubDomain","addsubdomain",`domain=${a}`,`rootdomain=${b}`,`dir=pykk/sites/${a}`,"--output=json"],{timeout:3e4});if(!c.includes('"status":1'))return{created:!1,sslStarted:!1,message:`uapi failed to create ${d}: ${c.slice(0,200)}`}}catch(a){return{created:!1,sslStarted:!1,message:`uapi error creating ${d}: ${a.message}`}}let e=!1;try{await g("uapi",["SSL","start_autossl_check"],{timeout:3e4}),e=!0}catch{}return{created:!0,sslStarted:e,message:`Created ${d}${e?" and started AutoSSL":""}`}}},17479:(a,b,c)=>{c.d(b,{IG:()=>k,mi:()=>j,qE:()=>i});var d=c(73024),e=c.n(d),f=c(76760),g=c.n(f);let h=[{file:"inter-400.woff2",family:"Inter",weight:400},{file:"inter-700.woff2",family:"Inter",weight:700}],i={"dark-bold":{display:"Fraunces",body:"Inter",files:[{file:"fraunces-700.woff2",family:"Fraunces",weight:700},...h]},"light-elegant":{display:"Instrument Serif",body:"Inter",files:[{file:"instrument-serif-400.woff2",family:"Instrument Serif",weight:400},...h]},"warm-rustic":{display:"DM Serif Display",body:"Inter",files:[{file:"dm-serif-display-400.woff2",family:"DM Serif Display",weight:400},...h]},"bright-practical":{display:"Space Grotesk",body:"Inter",files:[{file:"space-grotesk-700.woff2",family:"Space Grotesk",weight:700},...h]}};function j(a){let b=a.files.map(a=>`@font-face {
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
`}function k(a,b){let c=g().join(b,"fonts");e().mkdirSync(c,{recursive:!0});let d=[];for(let b of a.files){let a=g().join(g().join(process.cwd(),"font-assets"),b.file);e().existsSync(a)&&(e().copyFileSync(a,g().join(c,b.file)),d.push(b.file))}return d}},84585:(a,b,c)=>{c.d(b,{Ac:()=>f});let d=["www","admin","app","api","mail","webmail","cpanel","ftp","pay","status","pykk","internal"],e=/^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;function f(a){return e.test(a)&&!d.includes(a)}},88625:(a,b,c)=>{c.a(a,async(a,d)=>{try{c.d(b,{S:()=>v});var e=c(73024),f=c.n(e),g=c(76760),h=c.n(g),i=c(11737),j=c(77319),k=c(74608),l=c(28701),m=c(3426),n=c(7115),o=c(14993),p=c(16699),q=c(13009),r=c(79678),s=c(17479),t=c(71733),u=a([i,j,k,m]);async function v(a){let b=(0,j.L)(),c=(await b.select().from(k.businesses).where((0,i.eq)(k.businesses.id,a)).limit(1))[0];if(!c)return;let d=async c=>{await b.update(k.businesses).set({websiteStatus:"failed",websiteNote:c.slice(0,255)}).where((0,i.eq)(k.businesses.id,a)),await (0,m.M)({actor:"system",action:"website.build_failed",entity:"business",entityId:a,after:{note:c}})};await b.update(k.businesses).set({websiteStatus:"building",websiteNote:null}).where((0,i.eq)(k.businesses.id,a));try{let d={...t.tX,...c.intakeJson??{}},e=await (0,n.X)(c,d),g=(process.env.PUBLIC_APP_HOST||"admin.pykk.uk").replace(/\/$/,""),j=(0,r.n)(e.html,{slug:c.slug,businessName:c.name,description:`${c.name} — a local ${(0,r.D)(c.type)} in the UK.`,publicAppHost:g,bookingEnabled:!!d.extras.enableBooking,services:d.services,address:d.address}),u=h().join((0,l.Sb)(),c.slug);f().mkdirSync(h().join(u,"admin"),{recursive:!0});let v=`?v=${Date.now()}`,w=j.replace(/href="styles\.css(\?[^"]*)?"/g,`href="styles.css${v}"`).replace(/src="script\.js(\?[^"]*)?"/g,`src="script.js${v}"`);f().writeFileSync(h().join(u,"index.html"),w);let x=s.qE[e.archetype.moodId];f().writeFileSync(h().join(u,"styles.css"),e.css+(0,s.mi)(x)),(0,s.IG)(x,u),e.js?f().writeFileSync(h().join(u,"script.js"),e.js):f().existsSync(h().join(u,"script.js"))&&f().rmSync(h().join(u,"script.js")),f().writeFileSync(h().join(u,"admin","index.html"),(0,q.Q)({slug:c.slug,publicAppHost:g}));let y=await (0,o.Q)(c.slug,`Add site: ${c.name} (site factory)`),z=await (0,p.z)(c.slug),A=[e.usedFallback?"fallback template used":"AI-drafted",e.council.applied.length>0?`council: ${e.council.applied.join(" → ")}`:null,y.message,z.message].filter(Boolean).join(" \xb7 ");await b.update(k.businesses).set({websiteStatus:e.usedFallback?"live_fallback":"live",websiteBuiltAt:new Date,websiteNote:A.slice(0,255)}).where((0,i.eq)(k.businesses.id,a)),await (0,m.M)({actor:"system",action:"website.built",entity:"business",entityId:a,after:{usedFallback:e.usedFallback,attempts:e.attempts,archetype:e.archetype.id,council:e.council,steps:e.steps,failures:e.failures.slice(0,6),note:A}})}catch(a){await d(a.message)}}[i,j,k,m]=u.then?(await u)():u,d()}catch(a){d(a)}})}};