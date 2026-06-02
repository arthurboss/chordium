// Temporary probe — test if Vercel's network can reach CifraClub without Puppeteer.
// DELETE THIS FILE after confirming results.
export default async function handler(req, res) {
  const targets = [
    { label: "search_jsonp",   url: "https://solr.sscdn.co/cc/h2/?q=oasis+wonderwall&callback=x" },
    { label: "artist_page",    url: "https://www.cifraclub.com.br/oasis/" },
    { label: "song_page",      url: "https://www.cifraclub.com.br/oasis/wonderwall/" },
    { label: "song_page_pre",  url: "https://www.cifraclub.com.br/oasis/wonderwall/" },
  ];

  const headers = {
    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "pt-BR,pt;q=0.9,en;q=0.8",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
  };

  const results = {};

  for (const t of targets) {
    try {
      const r = await fetch(t.url, { headers, redirect: "follow" });
      const text = await r.text();

      const info = {
        status: r.status,
        content_length: text.length,
      };

      if (t.label === "search_jsonp") {
        info.looks_like_jsonp = text.startsWith("x(") || text.startsWith("x ({");
        info.snippet = text.slice(0, 200);
      }

      if (t.label === "song_page_pre") {
        info.has_pre_tag   = text.includes("<pre");
        info.has_cifra_tom = text.includes("cifra_tom");
        info.has_song_id   = /songId/.test(text);
        if (info.has_pre_tag) {
          const idx = text.indexOf("<pre");
          info.pre_snippet = text.slice(idx, idx + 300);
        }
      }

      results[t.label] = info;
    } catch (e) {
      results[t.label] = { error: e.message };
    }
  }

  res.setHeader("Content-Type", "application/json");
  res.status(200).json(results);
}
