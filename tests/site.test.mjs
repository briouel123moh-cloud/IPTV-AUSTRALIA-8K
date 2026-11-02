import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { pages, questions } from '../src/content.mjs';
import { configuration, screens, durations, markets, quote, widget, previewOrigin } from '../src/site.mjs';

const config = configuration();
const html = new Map(await Promise.all(pages.map(async page =>
  [page.path, await readFile(path.join('dist', page.path.slice(1), 'index.html'), 'utf8')]
)));
const decode = str => str.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'");

test('each Australian route exports unique static metadata, a single H1 and matching contact identity', () => {
  const titles = new Set();
  const descriptions = new Set();
  for (const [route, document] of html) {
    assert.ok(document.includes('<html lang="en-AU">'), route);
    assert.equal((document.match(/<h1[ >]/g)||[]).length, 1, route);
    const title=document.match(/<title>(.*?)<\/title>/s)?.[1];
    const description=document.match(/<meta name="description" content="([^"]+)">/)?.[1];
    assert.ok(title && !titles.has(title), route);
    assert.ok(description && !descriptions.has(description), route);
    titles.add(title);
    descriptions.add(description);
    assert.ok(document.includes(`rel="canonical" href="${config.origin}${route}"`));
    const schema = JSON.parse(document.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(schema['@graph'][0].contactPoint.telephone, '+212631479723');
    assert.equal(schema['@graph'][1].inLanguage, 'en-AU');
    assert.doesNotMatch(JSON.stringify(schema), /AggregateRating|reviewCount|"price":/);
  }
});

test('internal links, anchors and local assets resolve from every page', async () => {
  for (const [route, document] of html) {
    const matches = [...document.matchAll(/\b(?:href|src)="([^"]+)"/g)];
    for (const [,raw] of matches) {
      const url = new URL(decode(raw), config.origin + route);
      if (url.origin !== config.origin) continue;
      const content = html.get(url.pathname);
      if (!content) {
        await access(path.join('dist', url.pathname.slice(1)));
      } else if (url.hash) {
        assert.ok(content.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`), route+' '+raw);
      }
    }
  }
});

test('regional navigation exposes every other market and keeps the trial service separate', () => {
  for (const [route, document] of html) {
    const navigation = document.match(/<nav aria-label="Regional websites">(.*?)<\/nav>/s)[1];
    const outbound = [...navigation.matchAll(/href="([^"]+)"/g)].map(m => decode(m[1]));
    assert.deepEqual(outbound, markets.map(m => m[2]), route);
    assert.equal(new Set(outbound).size, 8);
    assert.doesNotMatch(navigation, /emeraldiptv|IPTV UK|iptv-australia-8k\.pages\.dev/i);
    assert.ok(document.includes('data-widget="'+widget.replaceAll('&','&amp;')+'"'), route);
    assert.ok(document.includes('data-open-trial'), route);
  }
});

test('all 42 direct quote URLs encode the exact duration, screen count and support number', () => {
  const combinations = new Set();
  for(const month of durations) for(const count of screens) {
    const url=new URL(quote(month,count));
    assert.equal(url.origin,'https://wa.me');
    assert.equal(url.pathname,'/212631479723');
    const message=url.searchParams.get('text');
    assert.ok(message.includes(`${month} ${month===1?'month':'months'}, ${count} ${count===1?'screen':'screens'}.`));
    assert.ok(message.includes('AUD quote?') && message.length < 90);
    combinations.add(message);
  }
  assert.equal(combinations.size,42);
  const planPage=html.get('/plans/');
  assert.equal((planPage.match(/aria-label="Quote for \d+ months and \d+ screens"/g)||[]).length,42);
});

test('changing the visible screen control changes every duration card and the accessible label', async () => {
  const cards=durations.map(month=>({dataset:{planMonths:String(month)},href:quote(month,1),
    setAttribute(key,value){this[key]=value;}}));
  const summary={textContent:''};
  let change;
  const picker={querySelectorAll:()=>cards,querySelector:s=>s.includes('checked')?{value:'1'}:summary,
    addEventListener(type, listener){if(type==='change')change=listener;}};
  const context={document:{querySelector:s=>s==='#choose-plan'?picker:null},window:{addEventListener(){}}, URL, URLSearchParams};
  vm.runInNewContext(await readFile('dist/site.js','utf8'), context);
  change({target:{name:'screens',value:'3'}});
  assert.equal(summary.textContent,'3 simultaneous screens selected');
  for (const card of cards) {
    assert.equal(new URL(card.href).searchParams.get('text'),new URL(quote(Number(card.dataset.planMonths),3)).searchParams.get('text'));
    assert.match(card['aria-label'], /3 screens$/);
  }
});

test('trial fallback and published FAQ answers match the visitor-facing content', () => {
  const document=html.get('/free-trial/');
  assert.ok(document.includes(`href="${widget.replaceAll('&','&amp;')}"`));
  assert.ok(document.includes('App/Smart TV') || document.includes('App or Smart TV') || document.includes('Smart TV'));
  assert.match(document,/24 hours/);
  assert.match(document,/seven.{0,30}30 days/);
  const qa=html.get('/questions/');
  const schema=JSON.parse(qa.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  const faq=schema['@graph'].find(v=>v['@type']==='FAQPage');
  assert.equal(faq.mainEntity.length,questions.length);
  for(const [q,a] of questions) assert.ok(qa.includes(q) && qa.includes(a));
});

test('preview stays noindex and cannot be marked indexable without a suitable custom hostname',async()=>{
  assert.throws(()=>configuration({PUBLIC_SITE_URL:previewOrigin,PUBLIC_INDEXABLE:'true'}));
  const sitemap=await readFile('dist/sitemap.xml','utf8');
  const robots=await readFile('dist/robots.txt','utf8');
  const headers=await readFile('dist/_headers','utf8');
  assert.equal((sitemap.match(/<url>/g)||[]).length,config.indexable?pages.length:0);
  assert.ok(headers.includes(previewOrigin+'/*\n  X-Robots-Tag: noindex, follow'));
  assert.equal(robots.includes('Sitemap:'),config.indexable);
  assert.ok(html.get('/').includes(`name="robots" content="${config.indexable?'index,follow':'noindex,follow'}`));
  assert.ok((await readFile('dist/404.html','utf8')).includes('noindex,follow'));
});
