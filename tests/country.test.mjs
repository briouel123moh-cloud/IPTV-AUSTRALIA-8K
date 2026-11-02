import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequest } from '../functions/_middleware.js';

function simulate(path, cfCountry, headers = {}, hostname = 'iptv-australia-8k.pages.dev') {
  const request = new Request('https://' + hostname + path, { headers });
  if (cfCountry) Object.defineProperty(request, 'cf', { value: { country: cfCountry } });
  return onRequest({
    request,
    env: { PUBLIC_INDEXABLE: 'true' },
    next: async () => new Response('site content', { status: 200 })
  });
}

test('Moroccan country policy covers storefront, widget and API paths and ignores forwarded overrides', async () => {
  for (const path of ['/', '/plans/', '/free-trial/', '/widget', '/api/trial', '/api/trial.js']) {
    const response = await simulate(path, 'MA', { 'CF-IPCountry': 'AU', 'X-Forwarded-For': '1.1.1.1' });
    assert.equal(response.status, 403, path);
    assert.match(response.headers.get('cache-control'), /no-store/);
  }
  assert.equal((await simulate('/', undefined, { 'CF-IPCountry': 'MA' })).status, 403);
  assert.equal((await simulate('/', 'AU', { 'CF-IPCountry': 'MA' })).status, 200);
  assert.equal((await simulate('/', undefined, { 'X-Forwarded-Country': 'MA' })).status, 200);
});

test('SEO resources and bundled assets are accessible regardless of country', async () => {
  for (const path of ['/robots.txt', '/sitemap.xml', '/sitemap-index.xml', '/llms.txt',
    '/images/iptv-australia-8k-dashboard.webp', '/fonts/manrope-latin-wght-normal.woff2',
    '/style.css', '/site.js', '/favicon.svg', '/.well-known/acme-challenge/proof']) {
    assert.equal((await simulate(path, 'MA')).status, 200, path);
  }
});

test('Pages Functions preserve preview noindex with a custom-domain rollout', async () => {
  for (const host of ['iptv-australia-8k.pages.dev', '12345678.iptv-australia-8k.pages.dev']) {
    assert.match((await simulate('/', 'AU', {}, host)).headers.get('x-robots-tag'), /noindex/);
  }
  assert.equal((await simulate('/', 'AU', {}, 'owned-domain.tld')).headers.get('x-robots-tag'), null);
});
