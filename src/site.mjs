export const brand = 'IPTV Australia 8K';
export const previewOrigin = 'https://iptv-australia-8k.pages.dev';
export const number = '212631479723';
export const widget = 'https://control.emeraldiptv.irish/widget?site=australia&lang=en';
export const durations = [1, 2, 3, 6, 7, 12, 24];
export const screens = [1, 2, 3, 4, 5, 6];
export const markets = [
  ['Canada', 'IPTV Canada 8K', 'https://iptv-canada-8k.com/en/'],
  ['United States', 'IPTV USA 8K', 'https://iptv-usa-8k.com/'],
  ['Belgium', 'IPTV Belgique 8K', 'https://iptv-belgique-8k.com/'],
  ['Ireland', 'IPTV Ireland Subscription', 'https://iptv-ireland-subscription.com/'],
  ['Finland', 'IPTV Suomi', 'https://iptv-suomi-iptv.fi/'],
  ['Nordic countries', 'Nordic IPTV Elite', 'https://www.nordiciptv-elite.com/iptv-nordic-2026/'],
  ['Germany', 'IPTV Deutschland 8K', 'https://iptv-deutschland-8k.pages.dev/'],
  ['Switzerland', 'IPTV Schweiz 8K', 'https://iptv-schweiz-8k.pages.dev/']
];

export function configuration(env = process.env) {
  const url = new URL(env.PUBLIC_SITE_URL || previewOrigin);
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('PUBLIC_SITE_URL must be a plain HTTPS origin.');
  }
  const indexable = env.PUBLIC_INDEXABLE === 'true';
  if (indexable && /(?:^|\.)(?:pages\.dev|workers\.dev|localhost|example\.com)$/.test(url.hostname)) {
    throw new Error('Enable indexing only after an owned production domain is connected.');
  }
  return { origin: url.origin, indexable };
}

export function whatsapp(message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function quote(months, count) {
  const duration = months === 'custom' ? 'custom term' : `${months} ${months === 1 ? 'month' : 'months'}`;
  return whatsapp(`Hi, IPTV Australia 8K: ${duration}, ${count} ${count === 1 ? 'screen' : 'screens'}. AUD quote?`);
}

export function escapeText(text) {
  return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
