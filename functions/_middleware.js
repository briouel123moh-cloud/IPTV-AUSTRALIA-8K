const publicFiles = new Set([
  '/robots.txt', '/sitemap.xml', '/sitemap-index.xml', '/llms.txt',
  '/favicon.svg', '/favicon.ico', '/style.css', '/site.js'
]);

function isPublicResource(pathname) {
  if (publicFiles.has(pathname)) return true;
  if (pathname.startsWith('/.well-known/acme-challenge/')) return true;
  return /^\/(?:images|fonts)\/[^/]+\.(?:webp|png|jpe?g|svg|woff2?|txt)$/i.test(pathname);
}

export async function onRequest({ request, next, env }) {
  const pathname = new URL(request.url).pathname;
  const country = (request.cf?.country || request.headers.get('CF-IPCountry') || '').toUpperCase();
  if (country === 'MA' && !isPublicResource(pathname)) {
    return new Response('This page is unavailable in your region.', {
      status: 403,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'private, no-store',
        'X-Robots-Tag': 'noindex, nofollow'
      }
    });
  }
  const result = await next();
  const hostname = new URL(request.url).hostname;
  const isPreview = hostname === 'iptv-australia-8k.pages.dev' ||
    hostname.endsWith('.iptv-australia-8k.pages.dev');
  if (isPreview || env?.PUBLIC_INDEXABLE !== 'true') {
    const response = new Response(result.body, result);
    response.headers.set('X-Robots-Tag', 'noindex, follow');
    return response;
  }
  return result;
}
