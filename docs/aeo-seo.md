# AEO and SEO groundwork

Chordium is intentionally not indexed yet. The site must stay out of search
engines and AI answer surfaces until the content and licensing questions are
settled.

## Current noindex controls

Three layers keep the site out of indexes:

- `frontend/public/robots.txt` disallows every crawler.
- `vercel.json` sends `X-Robots-Tag: noindex, nofollow, noarchive` on every route.
- `frontend/index.html` and the client metadata hook set a `robots` meta tag with
  `noindex, nofollow, noarchive`.

`VITE_ALLOW_INDEXING=true` flips only the client meta tag. Do not set it until
the robots file, the Vercel header, and the crawlable content work below are
ready together.

## Groundwork shipped

- `frontend/src/seo/page-metadata.ts` derives a title, description, canonical
  URL, Open Graph tags, Twitter card, and robots directive from the current
  route. `RootLayout` applies it on navigation.
- Home, search, upload, saved sheets, privacy, artist, and song routes have
  distinct titles and descriptions.
- The existing `WebApplication` JSON-LD remains in `index.html`.
- Static copy still serves one SPA shell for every route. Crawlers that do not
  run JavaScript see the shell, not the rendered page.

## Before enabling indexing

1. Decide the content and licensing model. Public chord and lyric pages built
   from scraped content carry DMCA and scaled-content risk. Prefer original
   chord-shape, technique, tuner, and capo content, and keep user imports and
   jam sheets out of the index.
2. Serve crawlable HTML for public routes. Add a Vercel function or prerender
   step that returns real head metadata, JSON-LD, and visible song or artist
   text. Unknown slugs must return real 404s instead of the SPA shell.
3. Add a generated `sitemap.xml` with canonical URLs and reference it from
   `robots.txt`.
4. Replace the `noindex` meta, the `X-Robots-Tag` header, and the blanket
   `Disallow` rule together.
5. Decide the AI-crawler policy. Search bots such as `OAI-SearchBot`,
   `Claude-SearchBot`, and `PerplexityBot` need access to be cited. Training
   bots such as `GPTBot`, `ClaudeBot`, and `Google-Extended` are a separate
   choice.
6. Add measurement: Google Search Console, Bing Webmaster and IndexNow, Vercel
   log drains for AI bots, and referrer segments for ChatGPT, Perplexity, and
   Gemini.

## Structured data to add with crawlable HTML

Use one JSON-LD `@graph` per page:

- `WebSite` with `SearchAction`
- `Organization` or `Person`
- `BreadcrumbList`
- `SoftwareApplication` with real offer data, no invented ratings
- `MusicComposition` on song pages

FAQ and HowTo rich results are not worth targeting; Google removed them.

## Later options

- `llms.txt` is cheap but had very low adoption in 2026. Publish it only after
  the pages are stable and truthful.
- An OpenAPI description for search and metadata endpoints helps agents, but
  only after the public content model is settled.
- Android App Links and the Play listing are already prepared separately.
