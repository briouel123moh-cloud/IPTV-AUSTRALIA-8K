import { brand, widget, quote, whatsapp, markets, durations, screens, escapeText as h } from './site.mjs';
import { pages, questions } from './content.mjs';

const byPath = new Map(pages.map(page => [page.path, page]));
const artwork = {
  dashboard: {
    file: 'dashboard', width: 1600, height: 900,
    title: 'IPTV Australia 8K viewing dashboard',
    alt: 'Australian rules football on a lounge-room screen beside news, sport and movie tiles, with Sydney Harbour outside.'
  },
  sports: {
    file: 'sports', width: 1200, height: 675,
    title: 'Australian IPTV live sport viewing guide',
    alt: 'IPTV Australia 8K sport montage showing Australian rules football, rugby league, cricket and surfing beside Sydney Harbour.'
  },
  cinema: {
    file: 'cinema', width: 1200, height: 675,
    title: 'Australian IPTV movies and series guide',
    alt: 'Original Australian genre posters for detective thrillers, drama, sci-fi, family comedy, cooking and coastal adventure.'
  }
};
function imageFor(page) {
  return artwork[page.path === '/live-sport/' ? 'sports' : page.path === '/movies-series/' ? 'cinema' : 'dashboard'];
}
function imagePath(image) {
  return `/images/iptv-australia-8k-${image.file}.webp`;
}
function picture(image, eager = false) {
  let responsive = '';
  if (image.file === 'dashboard') {
    const sizes = eager
      ? '(max-width: 800px) calc(100vw - 38px), (max-width: 1360px) 50vw, 628px'
      : '(max-width: 520px) calc(100vw - 30px), (max-width: 800px) 48vw, (max-width: 1360px) 32vw, 410px';
    responsive = `srcset="/images/iptv-australia-8k-dashboard-800.webp 800w, ${imagePath(image)} 1600w" sizes="${sizes}"`;
  }
  return `<img src="${imagePath(image)}" ${responsive} width="${image.width}" height="${image.height}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} alt="${h(image.alt)}" title="${h(image.title)}">`;
}
const arrow = '<span aria-hidden="true">↗</span>';
const brandmark = '<span class="brand-mark" aria-hidden="true"><i></i><b></b></span>';
const logo = `${brandmark}<span><strong>IPTV Australia <em>8K</em></strong><small>AUSTRALIAN VIEWING EDITION</small></span>`;
const trial = (label = 'Generate free trial', style = 'btn bright') =>
  `<a class="${style}" href="${h(widget)}" data-open-trial>${h(label)} ${arrow}</a>`;
const link = (url, label, style = '') =>
  `<a class="${style}" href="${h(url)}">${h(label)} ${arrow}</a>`;
const pill = text => `<span class="kicker"><i></i>${h(text)}</span>`;

function faq(items) {
  return `<div class="answers">${items.map(([q, a]) => `<details><summary>${h(q)}<span aria-hidden="true"></span></summary><p>${h(a)}</p></details>`).join('')}</div>`;
}

function planPicker() {
  const names = ['One month', 'Two months', 'Three months', 'Six months', 'Seven months', 'Twelve months', 'Two years'];
  const notes = ['Start with a short term.', 'Cover the next two months.', 'Plan for a quarter.', 'Compare half a year.', 'A seven-month option.', 'Ask for the annual total.', 'Check a two-year commitment.'];
  return `<section class="plans section" id="choose-plan">
    <div class="wrap">
      <div class="section-head">${pill('Subscription desk')}<h2>Pick your screens.<br>Choose your term.</h2>
      <p>Compare one to six simultaneous streams. Every quote below goes directly to support in Australian dollars.</p></div>
      <div class="screen-panel">
        <fieldset><legend>How many screens will play at once?</legend><div class="screen-options">
        ${screens.map(n => `<label><input type="radio" name="screens" value="${n}" ${n === 1 ? 'checked' : ''}><span>${n}</span></label>`).join('')}
        </div></fieldset><output data-screen-summary aria-live="polite">1 simultaneous screen selected</output>
      </div>
      <div class="plan-grid">${durations.map((m, i) => `<article class="plan-card"><small>${String(i + 1).padStart(2,'0')} / DURATION</small>
        <h3>${names[i]}</h3><p>${notes[i]}</p><strong>Current AUD quote</strong>
        <a href="${h(quote(m, 1))}" data-plan-months="${m}" aria-label="Request ${m} ${m === 1 ? 'month' : 'months'} for 1 screen">Ask on WhatsApp ${arrow}</a></article>`).join('')}
        <article class="plan-card custom"><small>HOUSEHOLD ENQUIRY</small><h3>7+ screens</h3><p>Discuss a larger household or a different term.</p><strong>Custom AUD quote</strong>
        ${link(quote('custom','7+'),'Request a custom quote')}</article></div>
      <p class="fine">Confirm the complete AUD total, any player fee, allowed locations and renewal terms before activation.</p>
      <noscript><p class="fine">Use the table below to choose the exact screen count and duration when JavaScript is unavailable.</p></noscript>
      <details class="all-options"><summary>See all 42 duration and screen combinations</summary><div class="scroll-table"><table><caption>Request a quote for a specific term and screen count</caption><thead><tr><th scope="col">Term</th>${screens.map(n => `<th scope="col">${n} ${n===1?'screen':'screens'}</th>`).join('')}</tr></thead><tbody>
      ${durations.map(m => `<tr><th scope="row">${m} ${m===1?'month':'months'}</th>${screens.map(n => `<td><a href="${h(quote(m,n))}" aria-label="Quote for ${m} months and ${n} screens">AUD quote</a></td>`).join('')}</tr>`).join('')}
      </tbody></table></div></details>
    </div></section>`;
}

function trialSection() {
  return `<section class="trial-block section"><div class="wrap trial-grid"><div>${pill('Trial programme')}<h2>Seven trial days,<br>renewed daily.</h2>
    <p>Request access for an app, Smart TV or MAG box. One new request is available after 24 hours, up to seven in 30 days across our websites. Each login has its own expiry.</p>
    ${trial('Open the trial generator')} ${link('/free-trial/','Read the trial guide','subtle-link')}</div>
    <ol><li><b>01</b><div><strong>Choose the player</strong><span>Match the app’s login fields to the connection type.</span></div></li>
    <li><b>02</b><div><strong>Try your local feed</strong><span>Check the programme, captions and guide time.</span></div></li>
    <li><b>03</b><div><strong>Check the expiry</strong><span>Use the expiry shown with your trial details.</span></div></li></ol></div></section>`;
}

function articleSection(section, i) {
  const list = section.list ? `<ol>${section.list.map(s => `<li>${h(s)}</li>`).join('')}</ol>` : '';
  const table = section.table ? `<div class="scroll-table"><table><thead><tr>${section.table[0].map(cell=>`<th scope="col">${h(cell)}</th>`).join('')}</tr></thead><tbody>${section.table.slice(1).map(row => `<tr><th scope="row">${h(row[0])}</th>${row.slice(1).map(cell => `<td>${h(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  const related = section.links ? `<div class="source-links">${section.links.map(([label, url]) => link(url,label)).join('')}</div>` : '';
  return `<section class="article-section" id="section-${i+1}"><span class="chapter">${String(i+1).padStart(2,'0')}</span><div><h2>${h(section.h)}</h2>${(section.p||[]).map(s => `<p>${h(s)}</p>`).join('')}${list}${table}${related}</div></section>`;
}

function cards(paths, heading = 'Keep exploring', eyebrow = 'Next step', withArt = false) {
  return `<section class="guide-band section"><div class="wrap">${pill(eyebrow)}<h2>${h(heading)}</h2><div class="guide-grid">${paths.map((path,i) => {
    const page = byPath.get(path);
    return `<a href="${path}">${withArt ? picture(imageFor(page)) : ''}<span>${String(i+1).padStart(2,'0')} / ${h(page.category)}</span><h3>${h(page.h1)}</h3><p>${h(page.description)}</p><b>Read more ${arrow}</b></a>`;
  }).join('')}</div></div></section>`;
}

function home(page, hasHero) {
  return `<section class="hero"><div class="wrap hero-grid"><div class="hero-copy">
    ${pill('Live TV · Australia')}<h1>IPTV Australia <span>for your lounge room.</span></h1><p>${h(page.intro)}</p>
    <div class="actions">${trial('Generate my free trial')}${link('/plans/','Compare IPTV plans','btn outline')}</div>
    <small class="hero-foot"><i></i> No card required <i></i> AUD quotes <i></i> 1–6 screens</small></div>
    <figure class="hero-art"><div class="art-title"><b>AU <span>/</span> SIGNAL</b><span>AUSTRALIAN EDITION · 01</span></div>
    ${hasHero ? picture(artwork.dashboard, true) : '<div class="art-fallback" role="img" aria-label="Illustrative coastal television signal"><i></i></div>'}
    <figcaption><span>SPORT &amp; STORIES</span><span>LOCAL VIEWING GUIDE</span></figcaption></figure></div></section>
    <div class="fact-strip"><div class="wrap"><div><strong>1–24 months</strong><span>Seven term choices</span></div><div><strong>1–6 screens</strong><span>Simultaneous playback</span></div><div><strong>7 trial days</strong><span>Renewed daily, subject to limits</span></div><div><strong>AUD</strong><span>Ask for your complete price</span></div></div></div>
    ${cards(['/local-tv/','/live-sport/','/movies-series/'],'What’s on in your lounge?','Australian viewing',hasHero)}
    ${trialSection()}${planPicker()}
    ${cards(['/multi-screen/','/guides/iptv-cost-australia/','/connection-test/'],'Before you choose a plan','Buyer’s notebook')}
    <section class="section faq-home"><div class="wrap split-heading"><div>${pill('Help desk')}<h2>Good questions<br>before you buy.</h2>${link('/questions/','View all questions')}</div>${faq(questions.slice(0,4))}</div></section>`;
}

function calculator() {
  return `<section class="wrap calculator"><h2>Check the monthly equivalent</h2><p>Use amounts from your written quote. Include the full one-off cost for this term, then divide by the number of months.</p>
    <form id="cost-calculator"><label>Subscription total (AUD)<input type="number" name="total" min="0.01" step="0.01" required></label><label>Extra fees (AUD)<input type="number" name="extras" min="0" step="0.01" value="0" required></label>
    <label>Term in months<select name="months">${durations.map(m=>`<option value="${m}">${m}</option>`).join('')}</select></label>
    <button class="btn dark" type="submit">Calculate</button><output id="cost-result" aria-live="polite"></output></form>
    <noscript>Monthly equivalent = (subscription total + extra fees) ÷ months.</noscript></section>`;
}

function article(page, hasHero) {
  const action = page.kind === 'trial' ? trial('Generate my free trial') : page.kind === 'plans' ? link('#choose-plan','Choose screens','btn bright') : page.kind === 'contact' ? link(whatsapp('Hi, I need help with IPTV Australia 8K.'),'Chat on WhatsApp','btn bright') : '';
  const body = `<header class="page-hero"><div class="wrap"><nav aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><span>${h(page.category)}</span></nav>
    ${pill(page.category)}<h1>${h(page.h1)}</h1><p>${h(page.intro)}</p>${action}</div></header>
    ${hasHero && ['/live-sport/', '/movies-series/'].includes(page.path) ? `<figure class="wrap article-picture">${picture(imageFor(page))}<figcaption>Illustrative programming artwork. Confirm the exact feed or title during your trial.</figcaption></figure>` : ''}
    ${page.kind === 'plans' ? planPicker() : ''}
    ${page.sections?.length ? `<div class="wrap article-body">${page.sections.map(articleSection).join('')}</div>` : ''}
    ${page.kind === 'cost' ? calculator() : ''}
    ${page.kind === 'faq' ? `<div class="wrap all-faq">${faq(questions)}</div>` : ''}
    ${page.kind === 'trial' ? trialSection() : ''}
    ${cards(page.related||['/plans/','/free-trial/','/devices/'])}`;
  return body;
}

function head(page, config, hasHero, notFound) {
  const canonical=config.origin+page.path;
  const orgId=config.origin+'/#organisation';
  const graph=[
    {'@type':'Organization','@id':orgId,name:brand,url:config.origin+'/',areaServed:{'@type':'Country',name:'Australia'},contactPoint:{'@type':'ContactPoint',contactType:'customer support',telephone:'+212631479723',availableLanguage:'English'}},
    {'@type':'WebSite','@id':config.origin+'/#website',url:config.origin+'/',name:brand,inLanguage:'en-AU',publisher:{'@id':orgId}},
    {'@type':page.kind==='faq'?'FAQPage':'WebPage','@id':canonical+'#page',url:canonical,name:page.title,description:page.description,inLanguage:'en-AU',isPartOf:{'@id':config.origin+'/#website'},...(page.kind==='faq'?{mainEntity:questions.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}:{})}
  ];
  if(page.path!=='/' && !notFound) graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:config.origin+'/'},{'@type':'ListItem',position:2,name:page.h1,item:canonical}]});
  const robots=config.indexable&&!notFound?'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1':'noindex,follow';
  return `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#113f44"><title>${h(page.title)}</title>
    <meta name="description" content="${h(page.description)}"><meta name="robots" content="${robots}"><link rel="canonical" href="${h(canonical)}"><link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <meta property="og:type" content="website"><meta property="og:locale" content="en_AU"><meta property="og:site_name" content="${brand}"><meta property="og:title" content="${h(page.title)}"><meta property="og:description" content="${h(page.description)}"><meta property="og:url" content="${h(canonical)}">
    ${hasHero ? `<meta property="og:image" content="${config.origin}${imagePath(imageFor(page))}"><meta property="og:image:type" content="image/webp"><meta property="og:image:width" content="${imageFor(page).width}"><meta property="og:image:height" content="${imageFor(page).height}"><meta property="og:image:alt" content="${h(imageFor(page).alt)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${h(page.title)}"><meta name="twitter:description" content="${h(page.description)}"><meta name="twitter:image" content="${config.origin}${imagePath(imageFor(page))}"><meta name="twitter:image:alt" content="${h(imageFor(page).alt)}">` : ''}
    <link rel="preload" href="/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/style.css"><script defer src="/site.js"></script>
    ${notFound?'':`<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>`}</head>`;
}

function nav(page) {
  const items=[['/plans/','Plans'],['/free-trial/','Free trial'],['/devices/','Devices'],['/local-tv/','Local TV'],['/questions/','Help']];
  const navlinks=items.map(([path,label])=>`<a href="${path}" ${page.path===path?'aria-current="page"':''}>${label}</a>`).join('');
  return `<a class="skip" href="#main">Skip to content</a><header class="mast"><div class="wrap mast-inner">
    <a class="brand" href="/" aria-label="IPTV Australia 8K home">${logo}</a><nav class="desktop-nav" aria-label="Main navigation">${navlinks}</nav>
    ${trial('Generate free trial','mast-cta')}<details class="mobile-menu"><summary>Menu</summary><nav aria-label="Mobile navigation">${navlinks}${link('/contact/','Contact')}</nav></details>
    </div></header>`;
}

function footer() {
  const local = [['/plans/','Subscription plans'],['/free-trial/','Free trial'],['/devices/','Devices'],['/local-tv/','Local channels'],['/live-sport/','Live sport'],['/movies-series/','Movies and series'],['/multi-screen/','Multi-screen plans'],['/guides/tv-guide-time/','TV guide times'],['/guides/iptv-cost-australia/','IPTV cost guide'],['/guides/choose-provider/','Compare providers'],['/questions/','Questions'],['/about/','About'],['/contact/','Contact'],['/privacy/','Privacy'],['/terms/','Terms']];
  return `<footer><div class="wrap footer-top"><div><a class="brand" href="/">${logo}</a><p>Test your home setup. Compare screens and request a current AUD quote.</p>${link(whatsapp('Hi, I need help with IPTV Australia 8K.'),'WhatsApp support')}</div>
    <nav aria-label="Explore this site"><h2>Explore Australia</h2>${local.map(([path,label])=>`<a href="${path}">${label}</a>`).join('')}</nav></div>
    <div class="wrap market-nav"><div><h2>Watching in another country?</h2><p>Find the local site for your household. Plans and availability vary by market.</p></div><nav aria-label="Regional websites">${markets.map(([,label,url])=>link(url,label)).join('')}</nav></div>
    <div class="wrap footline"><span>© 2026 IPTV Australia 8K</span><span>Australia · English · AUD</span><a href="#main">Back to top ↑</a></div></footer>`;
}

function dialog() {
  return `<dialog id="trial-dialog" aria-labelledby="trial-label" data-widget="${h(widget)}"><div class="dialog-head"><strong id="trial-label">IPTV Australia trial generator</strong><button type="button" data-close-trial>Close ×</button></div>
    <iframe title="Australia trial request form" data-trial-frame></iframe>
    <div class="dialog-footer"><a href="${h(widget)}" target="_blank" rel="noopener" data-direct>Open form directly ↗</a><a href="/privacy/">Privacy</a></div></dialog>`;
}

export function render(page, config, hasHero, notFound=false) {
  const body = notFound ? `<section class="page-hero"><div class="wrap">${pill('404')}<h1>Page not found</h1><p>This address may have changed. Start from the viewing guide or browse current plans.</p>${link('/','Go to homepage','btn bright')}</div></section>` : page.kind==='home' ? home(page,hasHero) : article(page, hasHero);
  return head(page, config, hasHero, notFound)+'<body>'+nav(page)+'<main id="main">'+body+'</main>'+footer()+dialog()+'</body></html>';
}
