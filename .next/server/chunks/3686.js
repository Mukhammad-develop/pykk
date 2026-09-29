"use strict";exports.id=3686,exports.ids=[3686],exports.modules={53686:(a,b,c)=>{c.d(b,{runCouncil:()=>g});var d=c(67131),e=c(75468),f=c(69659);async function g(a,b){let c=(process.env.COUNCIL_MODELS||"~anthropic/claude-opus-latest,moonshotai/kimi-k3,openai/gpt-6-astra").split(",").map(a=>a.trim()).filter(Boolean),g=[],h=[],i={...a},j=a=>a.split("/").pop()??a;for(let a of c)try{let c=await (0,e.q)(a,[{role:"system",content:`You are ${j(a)}, a world-class reviewer of small-business websites. Another model built this one-page site for a UK local business. Review it hard and return the FULL corrected files in this exact format:
=== index.html ===
(the file)
=== styles.css ===
(the file)
Surgical fixes only — never a wholesale rewrite.`},{role:"user",content:`THE CONCEPT the site must embody:
${b.concept}

FACTS it may use (anything else is invented and must go):
Business: ${b.business.name} (${b.business.slug})
Services/prices: ${b.intake.services.map(a=>`${a.name} ${a.price?`\xa3${a.price}`:""}`).join(", ")||"none"}
Hours: ${JSON.stringify(b.intake.hours)}
Story: ${b.intake.additionalInfo||"not provided"}
Reviews: ${b.intake.reviews.map(a=>`"${a.text}" — ${a.author}`).join("; ")||"none"}

Review for: factual slips (remove anything not in the facts), broken or duplicated content, weak copy, accessibility issues, layout/CSS problems, and anything that smells like a free template. Keep: the <!--BOOKING--> and <!--MAP--> markers, lang="en-GB", every fact verbatim, the local confident voice, and the concept's mood.

THE SITE:
=== index.html ===
${i.html}
=== styles.css ===
${i.css}`}],{maxTokens:32e3}),k=(0,d.l)(c);if(!k){h.push({model:a,reason:"unreadable answer"});continue}let l=(0,f.Q)(k.html,k.css,{slug:b.slug,publicAppHost:b.host});if(l.length>0){h.push({model:a,reason:`produced invalid output: ${l[0]}`});continue}i={html:k.html,css:k.css,js:k.js??i.js},g.push(j(a))}catch(b){h.push({model:a,reason:b.message.slice(0,120)})}return{...i,applied:g,skipped:h}}}};