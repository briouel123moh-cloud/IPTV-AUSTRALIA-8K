# IPTV Australia 8K

Australian storefront for the `iptv-australia-8k` Cloudflare Pages project. The static Node build exports 19 pages and a dedicated 404. Assets are served locally.

## Build

Use Node 22 or later. Run `npm ci`, then `npm run check`. Pages runs `npm run build` and serves `dist`. The project has no runtime or build dependencies.

The checked-in Wrangler production and preview settings use `https://iptv-australia-8k.pages.dev` and `PUBLIC_INDEXABLE=false`. Standard and deployed builds require the three finished WebP images and the 800-pixel dashboard variant. A local development build can render a CSS fallback only when `ALLOW_DRAFT_ARTWORK=true` is explicitly set.

For an owned domain, first connect DNS and HTTPS, update the shared trial profile to list the new HTTPS origin first, then set the production `PUBLIC_SITE_URL` and `PUBLIC_INDEXABLE=true` in `wrangler.jsonc`. Keep preview indexing disabled and verify the live canonical, sitemap, robots, trial form and host redirects. The public-domain sitemap emits 19 canonical URLs and the page’s own images. The temporary Pages sitemap has no indexable entries.

The Pages middleware applies a country restriction to storefront and API requests when Cloudflare resolves the visitor country to Morocco. SEO files, bundled static assets and ACME challenges remain accessible. The build emits an `llms.txt` reference with the current canonical routes.

## Australian content and visitor flows

| Visitor intent | Page |
| --- | --- |
| IPTV Australia | `/` |
| IPTV Australia subscription, AUD plan requests | `/plans/` |
| IPTV Australia free trial | `/free-trial/` |
| Multi-device IPTV, simultaneous connections | `/multi-screen/` |
| IPTV prices and complete AUD costs | `/guides/iptv-cost-australia/` |
| Australian local channels and guide times | `/local-tv/`, `/guides/tv-guide-time/` |
| Sport, films and series | `/live-sport/`, `/movies-series/` |
| Smart TV, Fire TV, Apple TV setup | `/devices/`, `/guides/fire-tv-setup/`, `/guides/apple-tv-setup/` |
| Evening playback and network checks | `/connection-test/` |
| Provider comparison | `/guides/choose-provider/` |

The keyword mapping describes visitor intent. It does not represent measured search volumes, CPCs or difficulty scores.

The plans component supports seven terms and six simultaneous screen counts. It updates every card’s short WhatsApp request and exposes all 42 combinations in a static table. Limits for 7+ screens are confirmed on request. The cost calculator uses the visitor’s own written AUD quote.

The trial form opens on demand at `https://control.emeraldiptv.irish/widget?site=australia&lang=en`, with a direct-link fallback. Expected profile: Australia, English, country calling code 61, support `212631479723`, English privacy path `/privacy/`. One request after 24 hours, up to seven in 30 days, subject to provider expiry and shared limits. The form is the only functional shared activation integration. The regional navigation contains the eight other non-Emerald members.

Australian viewing references checked on 2 November 2026:

- ABC local TV listings: https://www.abc.net.au/tv/epg/
- ABC iview: https://iview.abc.net.au/
- SBS live TV: https://www.sbs.com.au/ondemand/live
- SBS On Demand: https://www.sbs.com.au/ondemand/
- Freeview Australia TV guide: https://freeview.com.au/tv-guide
- nbn home optimisation: https://www.nbnco.com.au/learn/optimisation

These official sources are linked where viewers check a programme, guide or internet setup. Named programmes and providers do not establish carriage or affiliation.
