import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { pages } from '../src/content.mjs';
import { render } from '../src/render.mjs';
import { configuration, escapeText, previewOrigin } from '../src/site.mjs';

const project = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(project, 'dist');
const publicDir = path.join(project, 'public');
const config = configuration();
const assetNames = ['dashboard', 'dashboard-800', 'sports', 'cinema'].map(role => `iptv-australia-8k-${role}.webp`);
const hasHero = assetNames.every(name => existsSync(path.join(publicDir, 'images', name)));
const localArtworkDraft = process.env.ALLOW_DRAFT_ARTWORK === 'true' &&
  process.env.REQUIRE_ARTWORK !== 'true' && !process.env.CF_PAGES;
if (!hasHero && !localArtworkDraft) {
  throw new Error('The Australian dashboard, mobile dashboard, sports and cinema images are required for release.');
}

await rm(dist, { recursive: true, force: true });
await cp(publicDir, dist, { recursive: true });
for (const page of pages) {
  const directory = path.join(dist, page.path.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), render(page, config, hasHero));
}
const notFound = {path:'/404.html', title:'Page not found | IPTV Australia 8K', h1:'Page not found', category:'Help', description:'Find the Australian viewing guide and current IPTV plans.'};
await writeFile(path.join(dist, '404.html'), render(notFound, config, hasHero, true));

const escape = escapeText;
const entries = [];
if (config.indexable) {
  for (const page of pages) {
    const html = await readFile(path.join(dist, page.path.slice(1), 'index.html'), 'utf8');
    const images = [...new Set([...html.matchAll(/<img\b[^>]*\ssrc="(\/images\/[^"?#]+)"/g)].map(match => match[1]))];
    entries.push(`<url><loc>${escape(config.origin + page.path)}</loc><lastmod>2026-11-02</lastmod>${images.map(src => `<image:image><image:loc>${escape(config.origin + src)}</image:loc></image:image>`).join('')}</url>`);
  }
}
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${entries.join('\n')}</urlset>\n`;
const index = config.indexable
  ? `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${escape(config.origin)}/sitemap.xml</loc></sitemap></sitemapindex>\n`
  : sitemap;
const headers = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Permissions-Policy: camera=(), microphone=(), geolocation=()
${config.indexable ? '' : '  X-Robots-Tag: noindex, follow\n'}
${previewOrigin}/*
  X-Robots-Tag: noindex, follow
https://:preview.iptv-australia-8k.pages.dev/*
  X-Robots-Tag: noindex, follow
/robots.txt
  Content-Type: text/plain; charset=utf-8
/sitemap.xml
  Content-Type: application/xml; charset=utf-8
/sitemap-index.xml
  Content-Type: application/xml; charset=utf-8
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`;
const robots = `User-agent: *\nAllow: /\n${config.indexable ? `Sitemap: ${config.origin}/sitemap-index.xml\n` : '# This preview is served with noindex headers.\n'}`;
const reference = [
  '# IPTV Australia 8K',
  '',
  '> Australian household guide to IPTV subscription quotes, device setup and trial access.',
  '',
  'Plans are quoted in AUD for the requested duration and simultaneous screens. The trial allows one new request after 24 hours, up to seven in 30 days across the network. Each credential has its own expiry.',
  '',
  ...pages.map(page => `- [${page.h1}](${config.origin}${page.path}): ${page.description}`)
].join('\n') + '\n';
await Promise.all([
  writeFile(path.join(dist, 'llms.txt'), reference),
  writeFile(path.join(dist, 'robots.txt'), robots),
  writeFile(path.join(dist, 'sitemap.xml'), sitemap),
  writeFile(path.join(dist, 'sitemap-index.xml'), index),
  writeFile(path.join(dist, '_headers'), headers)
]);
console.log(`Built ${pages.length} Australian pages plus 404; ${entries.length} indexable sitemap URLs; artwork ${hasHero ? 'ready' : 'pending'}.`);
